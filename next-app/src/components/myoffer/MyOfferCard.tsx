import { Avatar, Box, Flex, Tag, Text } from "@chakra-ui/react";
import { Contract } from "ethers";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import {
  formatBigInt,
  formatFixed,
  USDT_DECIMAL,
  WEI6,
} from "../../features/formatters";

interface OfferProps {
  offer: Offer;
  pointMarketContract: Contract | null;
}

const MyOfferCard: FC<OfferProps> = ({ offer, pointMarketContract }) => {
  const router = useRouter();

  const [offerData, setOfferData] = useState<any | null>();
  const [isBuyer, setIsBuyer] = useState<boolean>(false);
  const [originalOfferData, setOriginalOfferData] = useState<any | null>();

  const getData = async () => {
    if (!pointMarketContract) return;
    try {
      const offerData = await pointMarketContract.getOffer(offer.offerId);
      // const originalOrderId = offerData[10];
      const orderData = await pointMarketContract.getOrder(
        offer.originalOrderId
      );
      const originalOfferData = await pointMarketContract.getOffer(
        orderData[0]
      );

      //open인 offer만 선택
      if (offerData[7] == 1) {
        setOfferData(offerData);
        // setOrderData(orderData);
        setOriginalOfferData(originalOfferData);

        let isBuyer;
        if (Number(offerData[11]) === 0) {
          isBuyer = Number(offerData[0]) == 1;
        } else {
          isBuyer = Number(offerData[11]) == 2;
        }
        setIsBuyer(isBuyer);
      }
    } catch (error) {
      console.error("Error fetching offer data: ", error);
    }
  };

  useEffect(() => {
    if (!pointMarketContract) return;

    getData();
  }, [pointMarketContract]);

  return offerData ? (
    <Box
      p={4}
      borderRadius={"sm"}
      border="1px solid"
      borderColor="green.700"
      w="100%"
      cursor="pointer"
      boxShadow="0 4px 10px rgba(0, 0, 0, 0.1)"
      position="relative"
      onClick={() => router.push(`/offer/${Number(offer.offerId)}`)}
    >
      <Flex justifyContent="space-between" mb={4}>
        <Flex fontWeight="bold" fontFamily={"lato"} gap={4}>
          <Avatar
            boxSize="20px"
            name={`Morph Logo`}
            src={`/symbol/Morph.png`}
          />{" "}
          MORPH{" "}
          <Tag colorScheme="cyan" py={1} px={2} fontSize={"xs"}>
            No. {offer.offerId.toString()}
          </Tag>
        </Flex>
        {Number(offerData[10]) == 0 ? (
          <Tag colorScheme="teal">New</Tag>
        ) : isBuyer ? (
          <Tag colorScheme="blue">Buyer</Tag>
        ) : (
          <Tag colorScheme="red">Seller</Tag>
        )}
      </Flex>
      <Box fontSize="14px" color="gray.100">
        <Flex alignItems={"center"} gap={2}>
          <Box>
            {" "}
            Amount: {formatBigInt((Number(offerData[3]) / WEI6).toString())}
          </Box>
        </Flex>
        <Flex alignItems={"center"} gap={2}>
          <Box>Price:</Box>
          <Box as="span" mr="4">
            {Math.floor(Number(offerData[4]) / USDT_DECIMAL).toString()} USDT
          </Box>
          {Math.floor(Number(offerData[4]) / USDT_DECIMAL).toString()} USD
        </Flex>
        <Box>
          Price Per Point: $
          {!isBuyer
            ? formatFixed(
                (Number(originalOfferData[5]) * 2 - Number(offerData[4])) /
                  Number(offerData[3])
              )
            : formatFixed(Number(offerData[4]) / Number(offerData[3]))}
        </Box>
      </Box>
    </Box>
  ) : (
    <></>
  );
};

export default MyOfferCard;
