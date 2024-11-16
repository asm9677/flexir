import { Flex, Text } from "@chakra-ui/react";
import { formatUnits } from "ethers";
import Link from "next/link";
import React, {
  FC,
  useEffect,
  useState,
} from "react";
import { GoLinkExternal } from "react-icons/go";
import { useAccount } from "@/context/AccountProvider"
import { useContract } from "@/hooks/useContract";
import { Contract } from "ethers";
import Countdown from "react-countdown";

interface OfferInfoProps {

}

const formatTimestamp = (blockTimestamp: number) => {
  const blockDate = new Date(Number(blockTimestamp) * 1000);
  const year = blockDate.getUTCFullYear();
  const month = String(blockDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(blockDate.getUTCDate()).padStart(2, "0");
  const hours = String(blockDate.getUTCHours()).padStart(2, "0");
  const minutes = String(blockDate.getUTCMinutes()).padStart(2, "0");

  return `${year}.${month}.${day} ${hours}:${minutes} UTC`;
};

const Completionist = () => <span>Overdue</span>;

const OfferInfo: FC<OfferInfoProps> = ({
}) => {
  const { signer } = useAccount();
  const { flexirContract } = useContract();
  const [originOfferTx, setOriginOfferTx] = useState<string>("");

  return (
    <Flex
      w="40%"
      h="500px"
      border="1px solid"
      borderColor="green.700"
      rounded="lg"
    >
      <Flex flexDir="column" w="full" m={4} justifyContent="space-between">
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Offer</Text>
          <Text color="white">{100} GRASS</Text>
        </Flex>
        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">For</Text>
          <Text color="white">{100} USDT</Text>
        </Flex>
        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Price / Point</Text>
          <Text color="white">
            $100
          </Text>
        </Flex>

        
          <>
            <hr style={{ borderColor: "#234753" }} />
            <Flex w="full" justifyContent="space-between">
              <Text color="gray.300">Collateral</Text>

              <Text color="white">100 USDT</Text>
            </Flex>
          </>

        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Origin Offer Creator</Text>
          <Flex alignItems="center" gap={1}>
            <Text color="white">
              0x1234...5678
            </Text>
            <Link
              href={`https://sepolia.etherscan.io/address/0x12345678`}
              target="_blank"
            >
              <GoLinkExternal color="white" />
            </Link>
          </Flex>
        </Flex>
        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Origin Offer Tx</Text>
          <Flex alignItems="center" gap={1}>
            <Text color="white">
              {originOfferTx?.slice(0, 5)}...{originOfferTx?.slice(-3)}
            </Text>
            <Link
              href={`https://sepolia.etherscan.io/tx/0x12345678`}
              target="_blank"
            >
              <GoLinkExternal color="white" />
            </Link>
          </Flex>
        </Flex>
        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Starting at</Text>
          <Text color="white">
             TBA
          </Text>
        </Flex>
        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Closing at</Text>
          <Text color="white">
            TBA
          </Text>
        </Flex>
        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Closing in</Text>
          <Text color="white">
              Not Started
           
          </Text>
        </Flex>
        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Token amount</Text>
          <Text color="white">
            TGE
          </Text>
        </Flex>
        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Settle status</Text>
          <Text color="white">Unsettled</Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default OfferInfo;
