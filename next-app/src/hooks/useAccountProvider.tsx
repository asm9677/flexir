"use client";

import { BrowserProvider, JsonRpcSigner, ethers } from "ethers";
import { useMemo, useState } from "react";
import networks from "@/data/chains.json";

type Project = {
  name: string;
  tokenId: string;
  address: string;
  img: string;
};

type Network = {
  src: string;
  balance: string;
  chainId: number;
  network: string;
  rpc: string[];
  name: string;
  symbol: string;
  decimals: number;
  blockExplorerUrl: string[];
  flexirAddress: string;
  usdtAddress: string;
  projects: Project[];
};

export const useAccountProvider = (): {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  connectProvider: () => void;
  chainId: number;
  curChain: Network | undefined;
} => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number>(5000);

  const connectProvider = () => {
    const newProvider = new ethers.BrowserProvider(window.ethereum);
    newProvider.getNetwork().then((res) => setChainId(Number(res.chainId)));
    setProvider(newProvider);

    window.ethereum.on("chainChanged", (chainId: string) => {
      setChainId(parseInt(chainId, 16));

      if (localStorage.getItem("loggedIn")) {
        connectWallet();
      } else {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);
      }
    });
  };

  const connectWallet = async () => {
    if (!window.ethereum) return;
    try {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);

      const newSigner = await newProvider.getSigner();
      setSigner(newSigner);

      const address = await newSigner.getAddress();
      setAccount(address);

      window.localStorage.setItem("loggedIn", "true");
    } catch (error) {
      console.error("Failed to connect to MetaMask:", error);
    }
  };

  const disconnectWallet = () => {
    setSigner(null);
    setAccount(null);
    window.localStorage.removeItem("loggedIn");
  };

  const curChain = useMemo(() => {
    return networks.find((v) => chainId == v.chainId);
  }, [networks, chainId]);

  return {
    provider,
    signer,
    account,
    connectWallet,
    disconnectWallet,
    connectProvider,
    chainId,
    curChain,
  };
};
