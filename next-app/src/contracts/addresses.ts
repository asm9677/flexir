import flexirABI from "./abis/flexirABI.json";
import ERC20ABI from "./abis/ERC20ABI.json";

export const contracts = {
  flexir: {
    address: "0x000000000000000000000000000000000000dead",
    abi: flexirABI,
  },
  token: {
    address: "0x000000000000000000000000000000000000dead",
    abi: ERC20ABI,
  },
  usdt: {
    address: "0x000000000000000000000000000000000000dead",
    abi: ERC20ABI,
  },
};
