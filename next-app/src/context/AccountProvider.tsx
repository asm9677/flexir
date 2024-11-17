"use client";

import { createContext, ReactNode, useContext } from "react";
import { useAccountProvider } from "@/hooks/useAccountProvider";
import { BrowserProvider, JsonRpcSigner } from "ethers";

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

interface AccountContextProps {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  connectProvider: () => void;
  chainId: number;
  curChain: Network | undefined;
}

const AccountContext = createContext<AccountContextProps | undefined>(
  undefined
);
export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const {
    provider,
    signer,
    account,
    connectWallet,
    disconnectWallet,
    connectProvider,
    chainId,
    curChain,
  } = useAccountProvider();
  return (
    <AccountContext.Provider
      value={{
        provider,
        signer,
        account,
        connectWallet,
        disconnectWallet,
        connectProvider,
        chainId,
        curChain,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within AccountProvider)");
  }
  return context;
};
