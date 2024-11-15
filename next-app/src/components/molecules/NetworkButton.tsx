"use client";
import { useAccount } from "@/context/AccountProvider";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Image,
  Box,
  Flex,
} from "@chakra-ui/react";
import { BigNumberish } from "ethers";
import { AddressLike, formatEther } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { MdArrowDropDown } from "react-icons/md";

export const networks = [
  {
    src: "/symbol/Ethereum.png",
    balance: "/symbol/eth_symbol.png",
    chainId: 1,
    network: "Ethereum",
    rpc: ["https://mainnet.infura.io/v3/"],
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
    blockExplorerUrl: ["https://etherscan.io"],
  },
  {
    src: "/symbol/Optimism.png",
    balance: "/symbol/eth_symbol.png",
    chainId: 10,
    network: "Optimism",
    rpc: ["https://mainnet.optimism.io"],
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
    blockExplorerUrl: ["https://optimistic.etherscan.io"],
  },
  {
    src: "/symbol/BNB.png",
    balance: "/symbol/bnb_symbol.png",
    chainId: 56,
    network: "BNB Chain",
    rpc: ["https://bsc-dataseed.binance.org/"],
    name: "Binance Coin",
    symbol: "BNB",
    decimals: 18,
    blockExplorerUrl: ["https://bscscan.com"],
  },
  {
    src: "/symbol/Arbitrum.png",
    balance: "/symbol/eth_symbol.png",
    chainId: 42161,
    network: "Arbitrum",
    rpc: ["https://arb1.arbitrum.io/rpc"],
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
    blockExplorerUrl: ["https://arbiscan.io"],
  },
  {
    src: "/symbol/ethereum_logo.svg",
    balance: "/symbol/eth_symbol.png",
    chainId: 11155111,
    network: "Sepolia",
    rpc: ["https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"],
    name: "Sepolia Test Ether",
    symbol: "ETH",
    decimals: 18,
    blockExplorerUrl: ["https://sepolia.etherscan.io"],
  },
];

const DropdownButton = () => {
  const { signer, chainId, account } = useAccount();

  const [balance, setBalance] = useState<BigNumberish>();

  useEffect(() => {
    signer?.provider.getBalance(account as AddressLike).then(setBalance);
  }, [signer]);

  const curNetwork = useMemo(() => {
    const res = networks.find((network) => network.chainId === chainId);
    return res;
  }, [chainId]);

  async function addNetwork(chainId: number) {
    try {
      const newNetwork = networks.find(
        (network) => network.chainId === chainId
      );
      // MetaMask에 네트워크 추가 요청
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x" + newNetwork?.chainId.toString(16), // 16진수로 변환한 chainId
            chainName: newNetwork?.network, // 네트워크 이름 (사용자가 원하는 네트워크 이름)
            rpcUrls: newNetwork?.rpc, // RPC URL (네트워크에 맞는 RPC 주소)
            nativeCurrency: {
              name: newNetwork?.name, // 해당 네트워크의 기본 토큰 이름
              symbol: newNetwork?.symbol, // 토큰 심볼 (예: ETH, BNB)
              decimals: newNetwork?.decimals, // 소수점 자릿수 (일반적으로 18)
            },
            blockExplorerUrls: newNetwork?.blockExplorerUrl, // 블록 탐색기 URL (선택사항)
          },
        ],
      });
    } catch (addError) {
      console.error("네트워크 추가 중 오류 발생:", addError);
    }
  }

  async function switchNetwork(chainId: number) {
    try {
      // MetaMask에 네트워크 변경 요청
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + chainId.toString(16) }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        addNetwork(chainId);
      }
    }
  }

  return (
    <Flex>
      <Menu>
        <MenuButton
          as={Button}
          leftIcon={
            <Image
              src={curNetwork?.src}
              height={"20px"}
              rounded={"4px"}
            ></Image>
          }
          rightIcon={<MdArrowDropDown />}
          colorScheme=""
          bg="gray.700"
          color="white"
          _hover={{ bg: "gray.700" }}
          w="160px"
          h="40px"
          fontSize={"14"}
          roundedRight={account ? 0 : 6}
          borderRight={account ? "1px solid #22232B" : ""}
        >
          {curNetwork?.network}
        </MenuButton>
        {account && (
          <Button
            as={Button}
            leftIcon={
              <Image
                src={curNetwork?.balance}
                height={"20px"}
                rounded={"4px"}
              ></Image>
            }
            bg="gray.700"
            color="white"
            _hover={{ bg: "gray.700" }}
            px="3"
            h="40px"
            fontSize={"14"}
            roundedLeft={0}
          >
            {balance ? parseFloat(formatEther(balance)).toFixed(4) : 0}
          </Button>
        )}
        <MenuList bg="white" color="dark" borderColor={"transparent"} p="0">
          {networks.map((v) => (
            <MenuItem
              display="flex"
              w="full"
              alignItems="center"
              gap="2"
              p="4"
              bg="gray.700"
              color="white"
              _hover={{ bg: "gray.700" }}
              onClick={() => switchNetwork(v.chainId)}
              key={v.chainId}
            >
              <Image
                src={v.src}
                style={{ width: "20px", height: "20px" }}
                alt={v.network}
                rounded={"4px"}
              />
              <Box fontSize="14px" fontWeight="semibold" color="dark">
                {v.network}
              </Box>
              {v.chainId === chainId && (
                <Flex flex="1" justifyContent="flex-end">
                  <Box bg="#1db1a8" w="8px" h="8px" borderRadius="full"></Box>
                </Flex>
              )}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default DropdownButton;
