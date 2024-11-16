import flexirABI from "./abis/flexirABI.json";
import ERC20ABI from "./abis/ERC20ABI.json";

export const contracts = {
  flexir: {
    address: "0x1EA19E1e231Fee735B919F3E1CB6aFa097CAa4e3",
    abi: flexirABI,
  },
  token: {
    address: "0x2E0ee63632E01785c1A4aF0B48cEaeC67bd0d7ec",
    abi: ERC20ABI,
  },
  usdt: {
    address: "0x0288aCae2beD47a3185b75113FD9E76344ecb3f3",
    abi: ERC20ABI,
  },
};
