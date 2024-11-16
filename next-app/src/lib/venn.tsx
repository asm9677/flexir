import { VennClient } from "@vennbuild/venn-dapp-sdk";
import { ethers } from "ethers";

const vennURL = "https://dc7sea.venn.build/sign";
const vennPolicyAddress = "0xca02e481651f0e933ffb770b82c8ec8875f26678";

const vennClient = new VennClient({ vennURL, vennPolicyAddress });

export const sendTransaction = async (
  signer: ethers.Signer,
  to: any,
  from: any,
  data: string,
  value: any
) => {
  const tx = { to, from, data, value };
  const approvedTransaction = await vennClient.approve(tx);
  const receipt = await signer.sendTransaction(approvedTransaction);
  return receipt;
};
