import { Avatar, Box, Flex, Tag } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { FC } from "react";
import { formatBigInt, formatFixed } from "../features/formatters";

interface OfferData {
  offerId: number;
  symbol: string;
  name: string;
  amount: string;
  price: number;
  point: number;
  usd: string;
  offerType: number;
  reofferStatus: number;
  originalOrderId: number;
  blockNumber: number;
  status: number;
}

interface OfferProps {
  offer: OfferData;
}

const OfferCard: FC<OfferProps> = ({ offer }) => {
  const router = useRouter();

  return (
    <Box
      opacity={offer.status !== 1 ? 0.5 : 1}
      p={4}
      borderRadius={"sm"}
      border="1px solid"
      borderColor="green.700"
      w="100%"
      cursor="pointer"
      boxShadow="0 4px 10px rgba(0, 0, 0, 0.1)"
      position="relative"
      onClick={() => router.push(`/offer/${offer.offerId}`)}
    >
      <Flex justifyContent="space-between" mb={4}>
        <Flex fontWeight="bold" fontFamily={"lato"} gap={4}>
          <Avatar
            boxSize="20px"
            name={`${offer.symbol} Logo`}
            src={`/symbol/Morph.png`}
          />{" "}
          {offer.name}{" "}
          <Tag colorScheme="cyan" py={1} px={2} fontSize={"xs"}>
            No. {offer.offerId.toString()}
          </Tag>
        </Flex>
        {offer.status === 1 && offer.reofferStatus === 0 && (
          <Tag colorScheme="teal">New</Tag>
        )}
        {offer.status !== 1 && <Tag colorScheme="red">Sold Out</Tag>}
      </Flex>
      <Box fontSize="14px" color="gray.100">
        <Flex alignItems={"center"} gap={2}>
          <Box> Amount: {formatBigInt(offer.amount)}</Box>
        </Flex>
        <Flex alignItems={"center"} gap={2}>
          <Box>Price:</Box>
          <Box as="span" mr="4">
            {(Math.floor(offer.price * 100) / 100).toString()} USDT
          </Box>
          {(Math.floor(offer.price * 100) / 100).toString()} USD
        </Flex>
        <Box>Price Per Point: ${formatFixed(offer.point)}</Box>
      </Box>
    </Box>
  );
};

export default OfferCard;
