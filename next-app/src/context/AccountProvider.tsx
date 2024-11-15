"use client";

import { createContext, ReactNode, useContext } from "react";
import { useAccountProvider } from "@/hooks/useAccountProvider";
import { BrowserProvider, JsonRpcSigner } from "ethers";

interface AccountContextProps {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  connectProvider: () => void;
  chainId: number;
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