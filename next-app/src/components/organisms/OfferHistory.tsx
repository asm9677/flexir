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
import React, { FC,  } from "react";
import OfferHistoryCard from "../molecules/OfferHistoryCard";

interface OfferHistoryProps {
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
}) => {

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
                  <OfferHistoryCard />
                  <OfferHistoryCard />
                  <OfferHistoryCard />
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default OfferHistory;
