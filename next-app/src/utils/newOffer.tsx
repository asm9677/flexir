import { Contract, ethers } from "ethers";
import { contracts } from "../contracts/addresses";
import networks from "@/data/chains.json";
import { notify } from "../lib";
import flexirABI from "../contracts/abis/flexirABI.json";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const onClickDeposit = async (
  flexirContract: Contract | null,
  signer: any,
  isSell: boolean,
  buying: number | null,
  forUsdt: number | null,
  usdtContract: Contract,
  setNewOfferLoading: (loading: boolean) => void,
  router: AppRouterInstance,
  chainId: number
) => {
  if (!flexirContract || !signer) return;

  if (flexirContract) {
    try {
      setNewOfferLoading(true);

      const offerType = isSell === true ? 2 : 1;
      const tokenId = ethers.zeroPadValue("0x01", 32);
      const offerAmount = ethers.parseUnits(Number(buying)?.toFixed(6), 6);
      const offerValue = ethers.parseUnits(Number(forUsdt)?.toFixed(6), 6);

      const userBalance = await usdtContract.balanceOf(signer.address);
      if (userBalance < offerValue) {
        notify("Unsufficient user balance.", false);
        return;
      }

      try {
        notify("Checking Allowance...", true);
        const currentAllowance = await usdtContract.allowance(
          signer.address,
          networks.find((v) => chainId == v.chainId)?.flexirAddress
        );

        if (currentAllowance < offerValue) {
          notify("Approving USDT...", true);
          const approveTx = await (
            usdtContract.connect(signer) as Contract
          ).approve(
            networks.find((v) => chainId == v.chainId)?.flexirAddress,
            offerValue
          );
          await approveTx.wait();
          notify("Approval completed !", true);
        } else {
          notify("Checking completed !", true);
        }
      } catch (error: any) {
        console.error("Error newOffer: ", error);
        notify(error.shortMessage, false);
      }

      const tx = await (flexirContract.connect(signer) as Contract).newOffer(
        offerType,
        tokenId,
        offerAmount,
        offerValue,
        contracts.usdt.address
      );

      const txResult = await tx.wait();

      const iface = new ethers.Interface(flexirABI);

      notify("Transaction confirmed successfully !", true);
      setTimeout(() => {
        console.log(txResult.logs);
        console.log(txResult.logs[1]);
        console.log(iface.parseLog(txResult.logs[1]));
        router.push(
          `/offer/${Number(
            iface.parseLog(txResult.logs[1])?.args[0]
          ).toString()}`
        );
      }, 2000);
    } catch (error: any) {
      console.error("Error newOffer: ", error);
      notify(error.shortMessage, false);
    } finally {
      setNewOfferLoading(false);
    }
  }
};
