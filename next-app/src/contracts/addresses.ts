import flexirABI from "./abis/flexirABI.json";
import ERC20ABI from "./abis/ERC20ABI.json";

export const contracts = {
  flexir: {
    address: "0x74A4Cc436435005a03c169d1B99c3bb6356Ce13D",
    abi: flexirABI,
  },
  token: {
    address: "0x3A683e7A3f8873a0389C5Aa8dDf830ebBe0DF311",
    abi: ERC20ABI,
  },
  usdt: {
    address: "0xAC86cfF21C87262d1F6ca30F54f4eBfe4f573d4F",
    abi: ERC20ABI,
  },
};
