"use client";

import { Contract } from "ethers";
import { contracts } from "../contracts/addresses";
import { useAccount } from "@/context/AccountProvider";

export const useContract = (): {
  flexirContract: Contract;
  tokenContract: Contract;
  usdtContract: Contract;
} => {
  const { provider } = useAccount();

  const flexirContract = new Contract(
    contracts.flexir.address,
    contracts.flexir.abi,
    provider
  );

  const tokenContract = new Contract(
    contracts.token.address,
    contracts.token.abi,
    provider
  );

  const usdtContract = new Contract(
    contracts.usdt.address,
    contracts.usdt.abi,
    provider
  );

  return {
    flexirContract,
    tokenContract,
    usdtContract,
  };
};
