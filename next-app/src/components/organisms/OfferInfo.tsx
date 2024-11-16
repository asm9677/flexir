import { Flex, Text } from "@chakra-ui/react";
import { formatUnits } from "ethers";
import Link from "next/link";
import React, {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { GoLinkExternal } from "react-icons/go";
import { useAccount } from "@/context/AccountProvider";
import { useContract } from "@/hooks/useContract";
import { Contract } from "ethers";
import Countdown from "react-countdown";

interface OfferInfoProps {
  offer: IOffer;
  offerId: string;
  order: IOrder | null;
  token: IToken;
  tokenAmount: string;
  settleStatus: string;
  setSettleStatus: Dispatch<SetStateAction<string>>;
  collateral: string;
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
  offer,
  offerId,
  order,
  token,
  tokenAmount,
  settleStatus,
  setSettleStatus,
  collateral,
}) => {
  const { signer, provider } = useAccount();
  const { flexirContract } = useContract();
  const [originOfferTx, setOriginOfferTx] = useState<string>("");

  useEffect(() => {
    fetchOriginOffer();
  }, [offer]);

  const fetchOriginOffer = async () => {
    if (offer) {
      try {
        let originOfferId = offerId;
        if (offer.originalOrderId != 0n) {
          const originalOrder = await (
            flexirContract.connect(signer) as Contract
          ).getOrder(offer.originalOrderId);
          originOfferId = originalOrder.offerId;
        }

        const latestBlock = await provider!.getBlock("latest");
        const latestBlockNumber = latestBlock!.number;
        const fromBlockNumber = latestBlockNumber - 4500;

        const originOfferTxEvent = await flexirContract.queryFilter(
          flexirContract.filters.NewOffer(originOfferId),
          fromBlockNumber,
          "latest"
        );

        setOriginOfferTx(originOfferTxEvent[0].transactionHash);
      } catch (error) {
        console.error("Failed to fetch origin offer tx: ", error);
      }
    }
  };

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
          <Text color="white">{formatUnits(offer.amount, 6)} MORPH</Text>
        </Flex>
        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">For</Text>
          <Text color="white">{formatUnits(offer.value, 6)} USDT</Text>
        </Flex>
        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Price / Point</Text>
          <Text color="white">
            ${Number(offer.value) / Number(offer.amount)}
          </Text>
        </Flex>

        {order && (
          <>
            <hr style={{ borderColor: "#234753" }} />
            <Flex w="full" justifyContent="space-between">
              <Text color="gray.300">Collateral</Text>

              <Text color="white">{collateral} USDT</Text>
            </Flex>
          </>
        )}

        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Origin Offer Creator</Text>
          <Flex alignItems="center" gap={1}>
            <Text color="white">
              {offer.offeredBy.slice(0, 5)}...
              {offer.offeredBy.slice(-3)}
            </Text>
            <Link
              href={`https://sepolia.etherscan.io/address/${offer.offeredBy}`}
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
              href={`https://sepolia.etherscan.io/tx/${originOfferTx}`}
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
            {token.status != 3 ? "TBA" : formatTimestamp(token.settleTime)}
          </Text>
        </Flex>
        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Closing at</Text>
          <Text color="white">
            {token.status != 3
              ? "TBA"
              : formatTimestamp(token.settleTime + token.settleDuration)}
          </Text>
        </Flex>
        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Closing in</Text>
          <Text color="white">
            {token.status != 3 ? (
              "Not Started"
            ) : (
              <Countdown
                date={Number(token.settleTime + token.settleDuration) * 1000}
                onComplete={() => setSettleStatus("Unsettled")}
              >
                <Completionist />
              </Countdown>
            )}
          </Text>
        </Flex>
        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Token amount</Text>
          <Text color="white">
            {tokenAmount == "" ? "TGE" : `${tokenAmount} MORPH`}
          </Text>
        </Flex>
        <hr style={{ borderColor: "#234753" }} />
        <Flex w="full" justifyContent="space-between">
          <Text color="gray.300">Settle status</Text>
          <Text color="white">{settleStatus}</Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default OfferInfo;
