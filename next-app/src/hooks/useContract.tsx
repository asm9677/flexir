"use client";

import { Contract } from "ethers";
import { contracts } from "../contracts/addresses";
import networks from "@/data/chains.json";
import { useAccount } from "@/context/AccountProvider";
import { useMemo } from "react";

export const useContract = (): {
  flexirContract: Contract;
  tokenContract: Contract;
  usdtContract: Contract;
} => {
  const { provider, chainId } = useAccount();

  const flexirContract = useMemo(() => {
    const curChain = networks.find((v) => chainId == v.chainId);
    const flexirContract = new Contract(
      curChain === undefined
        ? "0x0000000000000000000000000000000000000000"
        : curChain.flexirAddress,
      contracts.flexir.abi,
      provider
    );

    return flexirContract;
  }, [chainId]);

  const tokenContract = useMemo(() => {
    const curChain = networks.find((v) => chainId == v.chainId);

    const tokenContract = new Contract(
      curChain === undefined
        ? "0x0000000000000000000000000000000000000000"
        : curChain.projects[0].address,
      contracts.token.abi,
      provider
    );

    return tokenContract;
  }, [chainId]);

  const usdtContract = useMemo(() => {
    const curChain = networks.find((v) => chainId == v.chainId);

    const usdtContract = new Contract(
      curChain === undefined
        ? "0x0000000000000000000000000000000000000000"
        : curChain.usdtAddress,
      contracts.usdt.abi,
      provider
    );

    return usdtContract;
  }, [chainId]);

  return {
    flexirContract,
    tokenContract,
    usdtContract,
  };
};
