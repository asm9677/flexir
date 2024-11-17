import flexirABI from "./abis/flexirABI.json";
import ERC20ABI from "./abis/ERC20ABI.json";

export const contracts = {
  flexir: {
    address: "0x0e83F377546C5c4c6b87BC39943568bB35D141B0",
    abi: flexirABI,
  },
  token: {
    address: "0xFa1E20e9A6F8f6f7225FBa5D4962f3a3800718a3",
    abi: ERC20ABI,
  },
  usdt: {
    address: "0xaeBC6F5E9F3079c0A57c44bE018A136c6CE45D86",
    abi: ERC20ABI,
  },
};
