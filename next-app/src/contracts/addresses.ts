import flexirABI from "./abis/flexirABI.json";
import ERC20ABI from "./abis/ERC20ABI.json";

export const contracts = {
  flexir: {
    address: "0x38d9492F77315275A96CD7F2574C9f425F52Aa66",
    abi: flexirABI,
  },
  token: {
    address: "0xf7f0c8E9AB34885581373afD92FD0f185f20dB2E",
    abi: ERC20ABI,
  },
  usdt: {
    address: "0xDf13e17B411628106Dd4E6409e60C577571B220C",
    abi: ERC20ABI,
  },
};
