import React, { FC, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Tag,
  useDisclosure,
} from "@chakra-ui/react";
import { JsonRpcSigner, Contract } from "ethers";
import ResaleModal from "../ResaleModal";
import { useRouter } from "next/navigation";
import {
  formatBigInt,
  formatFixed,
  USDT_DECIMAL,
  WEI6,
} from "../../features/formatters";

interface OrderProps {
  order: Order;
  offers: Offer[];
  pointMarketContract: Contract | null;
  signer: JsonRpcSigner | null;
  subTabIndex: number;
}

const MyOrderCard: FC<OrderProps> = ({
  order,
  offers,
  pointMarketContract,
  signer,
  subTabIndex,
}) => {
  const router = useRouter();
  const userAddress = signer?.address.toLowerCase();

  const [orderData, setOrderData] = useState<any | null>(null);
  const [isBuyer, setIsBuyer] = useState<boolean>(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const getOrderData = async () => {
    if (!pointMarketContract) return;

    if (Number(order.resaleOfferId) === 0) {
      try {
        // 현재 orderId에 해당하는 최신 오퍼 찾기
        const currentOffer = offers.find(
          (offer) => Number(offer.originalOrderId) === Number(order.orderId)
        );

        const orderData = await pointMarketContract.getOrder(order.orderId);

        if (currentOffer) {
          try {
            const res = await pointMarketContract.getOffer(
              currentOffer.offerId
            );
            const offerStatus = Number(res[7]);

            // OfferStatus(1) = open
            if (offerStatus === 1) {
              const orderMap: OrderData = {
                orderId: Number(order.orderId),
                offerId: Number(currentOffer.offerId),
                amount: Number(order.amount),
                value: Number(order.value),
                deposit: Number(order.value) * 2,
                seller: orderData[3],
                buyer: orderData[4],
              };
              if (
                subTabIndex === 0 &&
                orderMap.buyer.toLowerCase() === userAddress
              ) {
                setOrderData(orderMap);
                setIsBuyer(true);
              } else if (
                subTabIndex === 1 &&
                orderMap.seller.toLowerCase() === userAddress
              ) {
                setOrderData(orderMap);
              } else {
                setOrderData(null);
              }
            }
          } catch (error) {
            console.error("Error fetching offer data:", error);
          }
        } else {
          const orderMap: OrderData = {
            orderId: Number(order.orderId),
            offerId: Number(orderData[0]),
            amount: Number(order.amount),
            value: Number(order.value),
            deposit: Number(order.value) * 2,
            seller: orderData[3],
            buyer: orderData[4],
          };

          if (
            subTabIndex === 0 &&
            orderMap.buyer.toLowerCase() === userAddress
          ) {
            setOrderData(orderMap);
            setIsBuyer(true);
          } else if (
            subTabIndex === 1 &&
            orderMap.seller.toLowerCase() === userAddress
          ) {
            setOrderData(orderMap);
          } else {
            setOrderData(null);
          }
        }
      } catch (error) {
        console.error("Error fetching order data: ", error);
        setOrderData(null);
      }
    } else if (Number(order.resaleOfferId) !== 0) {
      try {
        const offerData = await pointMarketContract.getOffer(
          order.resaleOfferId
        );

        const orderData = await pointMarketContract.getOrder(
          Number(offerData[10])
        );

        const orderMap: OrderData = {
          orderId: Number(offerData[10]),
          offerId: Number(order.resaleOfferId),
          amount: Number(order.amount),
          value: Number(order.value),
          deposit: Number(orderData[3]) * 2,
          seller: orderData[3],
          buyer: orderData[4],
        };
        if (subTabIndex === 0 && orderMap.buyer.toLowerCase() === userAddress) {
          setOrderData(orderMap);
          setIsBuyer(true);
        } else if (
          subTabIndex === 1 &&
          orderMap.seller.toLowerCase() === userAddress
        ) {
          setOrderData(orderMap);
        } else {
          setOrderData(null);
        }
      } catch (error) {
        console.error("Error fetching resale Order data: ", error);
      }
    }
  };

  useEffect(() => {
    if (!pointMarketContract || !signer) return;

    getOrderData();
  }, [pointMarketContract, signer, subTabIndex]);

  useEffect(() => {
    // console.log(orderData);
  }, [orderData]);
  return orderData ? (
    <Box
      p={4}
      borderRadius={"sm"}
      border="1px solid"
      borderColor="green.700"
      w="100%"
      cursor="pointer"
      boxShadow="0 4px 10px rgba(0, 0, 0, 0.1)"
      position="relative"
      onClick={() => router.push(`/offer/${Number(orderData.offerId)}`)}
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
            No. {orderData.orderId.toString()}
          </Tag>
        </Flex>
      </Flex>
      <Box fontSize="14px" color="gray.100">
        <Flex alignItems={"center"} gap={2}>
          <Box>
            {" "}
            Amount: {formatBigInt((Number(orderData.amount) / WEI6).toString())}
          </Box>
        </Flex>
        <Flex alignItems={"center"} gap={2}>
          <Box>Price:</Box>
          <Box as="span" mr="4">
            {Math.floor(Number(orderData.value) / USDT_DECIMAL).toString()} USDT
          </Box>
          {Math.floor(Number(orderData.value) / USDT_DECIMAL).toString()} USD
        </Flex>
        <Box>
          Price Per Point: $
          {!isBuyer
            ? formatFixed(
                Number(orderData.deposit - Number(orderData.value)) /
                  Number(orderData.amount)
              )
            : formatFixed(Number(orderData.value) / Number(orderData.amount))}
        </Box>
        <Flex w="100%" justifyContent="flex-end">
          <Button
            mt={2}
            w="35%"
            h="35px"
            bg="green.200"
            color="black"
            _hover={{ bg: "green.300" }}
            onClick={(e: any) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            Sell
          </Button>
        </Flex>
      </Box>
      <ResaleModal
        isOpen={isOpen}
        onClose={onClose}
        orderData={orderData}
        pointMarketContract={pointMarketContract}
        signer={signer}
        orderId={orderData.orderId}
      />
    </Box>
  ) : (
    <></>
  );
};

export default MyOrderCard;
