import { useAccount } from "@/context/AccountProvider";
import { useContract } from "@/hooks/useContract";
import {
  Flex,
  Table,
  TableContainer,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Contract } from "ethers";
import React, { FC, useEffect } from "react";
import OfferHistoryCard from "../molecules/OfferHistoryCard";

interface OfferHistoryProps {
  offer: IOffer;
  offerId: string;
  tradeHistory: ITradeHistory[] | null;
  setTradeHistory: React.Dispatch<React.SetStateAction<ITradeHistory[] | null>>;
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

const OfferHistory: FC<OfferHistoryProps> = ({
  offer,
  offerId,
  tradeHistory,
  setTradeHistory,
}) => {
  const { signer, provider } = useAccount();
  const { flexirContract } = useContract();

  useEffect(() => {
    fetchTradeHistory();
  }, [offer]);

  const fetchTradeHistory = async () => {
    if (signer && flexirContract && offer && provider) {
      try {
        let events = [];

        const latestBlock = await provider!.getBlock("latest");
        const latestBlockNumber = latestBlock!.number;
        const fromBlockNumber = latestBlockNumber - 4500;

        if (offer.originalOrderId == 0n) {
          events = await flexirContract.queryFilter(
            flexirContract.filters.NewOrder(null, offerId),
            fromBlockNumber,
            "latest"
          );
        } else {
          const originalOrder = await (
            flexirContract.connect(signer) as Contract
          ).getOrder(offer.originalOrderId);

          const originalOfferId = originalOrder.offerId;
          const [originalOrderEvents, resaleOfferEvents] = await Promise.all([
            flexirContract.queryFilter(
              flexirContract.filters.NewOrder(null, originalOfferId),
              fromBlockNumber,
              "latest"
            ),
            flexirContract.queryFilter(
              flexirContract.filters.ResaleOfferFilled(offerId),
              fromBlockNumber,
              "latest"
            ),
          ]);
          events = [...originalOrderEvents, ...resaleOfferEvents];
          events.sort((a, b) => b.blockNumber - a.blockNumber);
        }

        const tradeHistory = await Promise.all(
          events.map(async (event) => {
            const block = await provider.getBlock(event.blockNumber);
            const timestamp = formatTimestamp(block!.timestamp);
            const txHash = event.transactionHash;
            const offerId = event.topics[1];

            let seller, buyer;
            const log = flexirContract.interface.parseLog(event);

            if (log) {
              if (log.name === "NewOrder") {
                seller = log.args[4];
                buyer = log.args[5];
              } else if (log.name === "ResaleOfferFilled") {
                seller = log.args[4];
                buyer = log.args[3];
              }
            }

            return {
              timestamp,
              txHash,
              offerId,
              seller,
              buyer,
            };
          })
        );

        setTradeHistory(tradeHistory);
      } catch (error) {
        console.error("Failed to fetch trade history: ", error);
      }
    }
  };

  return (
    <Flex h="fit-content" w="full">
      <Flex
        w="full"
        mt={14}
        h="full"
        rounded="lg"
        border="1px solid"
        borderColor="green.700"
        flexDir="column"
        p={6}
      >
        <Flex mb={4}>
          <Text fontWeight="bold" textColor="white" fontSize="18px">
            Trade History
          </Text>
        </Flex>
        <Flex w="full">
          <TableContainer w="full">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="gray.300" borderColor={"teal.800"}>
                    TIME
                  </Th>
                  <Th color="gray.300" borderColor={"teal.800"}>
                    SELLER POSITION
                  </Th>
                  <Th color="gray.300" borderColor={"teal.800"}>
                    BUYER POSITION
                  </Th>
                  <Th color="gray.300" borderColor={"teal.800"}>
                    DEPOSITED
                  </Th>
                  <Th color="gray.300" borderColor={"teal.800"}>
                    Tx.Hash
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {tradeHistory?.map((v, i) => (
                  <OfferHistoryCard history={v} value={offer.value} key={i} />
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default OfferHistory;
