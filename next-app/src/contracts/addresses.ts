import flexirABI from "./abis/flexirABI.json";
import ERC20ABI from "./abis/ERC20ABI.json";

export const contracts = {
  flexir: {
    address: "0x06E36c2728838521fe7AEE1E8964182b5EFe342a",
    abi: flexirABI,
  },
  token: {
    address: "0x03055Eb06D439912D6C783b195F22723cE97B221",
    abi: ERC20ABI,
  },
  usdt: {
    address: "0x9589d417Fef5648518A512F378Ad257c8D3Fb9b3",
    abi: ERC20ABI,
  },
};
