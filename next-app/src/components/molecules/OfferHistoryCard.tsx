import { Flex, Td, Tr } from "@chakra-ui/react";
import { formatUnits } from "ethers";
import Link from "next/link";
import React, { FC } from "react";
import { GoLinkExternal } from "react-icons/go";

interface OfferHistoryCardProps {
}

const OfferHistoryCard: FC<OfferHistoryCardProps> = ({ }) => {
  return (
    <Tr alignItems="center">
      <Td color="white" borderColor={"teal.800"}>
        2024-11-16
      </Td>
      <Td color="white" borderColor={"teal.800"}>
        0x12345...678
      </Td>
      <Td color="white" borderColor={"teal.800"}>
      0x12345...678
      </Td>
      <Td color="white" borderColor={"teal.800"}>
      0x12345...678
      </Td>
      <Td color="white" borderColor={"teal.800"}>
        <Flex gap={1}>
        0x12345...678
          <Link
            href={`https://sepolia.etherscan.io/tx/0x12345678`}
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
