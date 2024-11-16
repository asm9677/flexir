import flexirABI from "./abis/flexirABI.json";
import ERC20ABI from "./abis/ERC20ABI.json";

export const contracts = {
  flexir: {
    address: "0xa482D491B6320B5f27B6bB5816Acaa7A8Bab7D51",
    abi: flexirABI,
  },
  token: {
    address: "0x84572b7757d167684193E34c0bB02381CA85bea7",
    abi: ERC20ABI,
  },
  usdt: {
    address: "0x44567F968430c01CEa34C8dE3A9ee4BC55d27cd5",
    abi: ERC20ABI,
  },
};
