import { Flex, Td, Tr } from "@chakra-ui/react";
import { formatUnits } from "ethers";
import Link from "next/link";
import React, { FC } from "react";
import { GoLinkExternal } from "react-icons/go";

interface OfferHistoryCardProps {
  history: ITradeHistory;
  value: bigint;
}

const OfferHistoryCard: FC<OfferHistoryCardProps> = ({ history, value }) => {
  return (
    <Tr alignItems="center">
      <Td color="white" borderColor={"teal.800"}>
        {history.timestamp}
      </Td>
      <Td color="white" borderColor={"teal.800"}>
        {history.seller.slice(0, 5) + "..." + history.seller.slice(-3)}
      </Td>
      <Td color="white" borderColor={"teal.800"}>
        {history.buyer.slice(0, 5) + "..." + history.buyer.slice(-3)}
      </Td>
      <Td color="white" borderColor={"teal.800"}>
        {formatUnits(value, 6)} USDT
      </Td>
      <Td color="white" borderColor={"teal.800"}>
        <Flex gap={1}>
          {history.txHash.slice(0, 5) + "..." + history.txHash.slice(-3)}
          <Link
            href={`https://sepolia.etherscan.io/tx/${history.txHash}`}
            target="_blank"
          >
            <GoLinkExternal color="white" />
          </Link>
        </Flex>
      </Td>
    </Tr>
  );
};

export default OfferHistoryCard;
