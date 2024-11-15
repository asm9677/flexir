"use client";

import { Flex } from "@chakra-ui/react";
import { NextPage } from "next";

import OfferHistory from "../organisms/OfferHistory";
import OfferTradeWidget from "../organisms/OfferTradeWidget";
import OfferInfo from "../organisms/OfferInfo";

interface OfferPageProps {
  offerId: string;
}

const OfferDetails: NextPage<OfferPageProps> = ({ offerId }) => {
  
  return (
    <Flex flexDir="column" mx="auto" mt="3%" pb={"50px"}>
        <Flex gap="4%" w="full" justifyContent="center" alignItems="center">
            <OfferTradeWidget />
            <OfferInfo />
        </Flex>
        <OfferHistory />
    </Flex>
  );
};

export default OfferDetails;
