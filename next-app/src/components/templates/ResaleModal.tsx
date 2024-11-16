import React, { FC, useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Flex,
  Box,
  Text,
  Image,
  Input,
} from "@chakra-ui/react";
import { Contract, ethers } from "ethers";
import { JsonRpcSigner } from "ethers";
import Link from "next/link";
import { FaDiscord, FaHome, FaTelegramPlane, FaTwitter } from "react-icons/fa";

interface ResaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
  pointMarketContract: Contract | null;
  signer: JsonRpcSigner | null;
  orderId: number;
}

interface Offer {
  offerId: number;
  offerStatus: number;
  blockNumber: number;
  originalOrderId: number;
}

const ResaleModal: FC<ResaleModalProps> = ({
  isOpen,
  onClose,
  orderData,
  pointMarketContract,
  signer,
  orderId,
}) => {
  const WEI6 = 1000000;
  const USDT_DECIMAL = 1000000;

  const [pricePerPoint, setPricePerPoint] = useState<string | null>(null);
  const [forUsdt, setForUsdt] = useState<string | null>(null);
  // const [offers, setOffers] = useState<Offer[]>([]);
  const [offerId, setOfferId] = useState<number>(0);
  const [isSelling, setIsSelling] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isBuyer, setIsBuyer] = useState<boolean>(false);

  const [updating, setUpdating] = useState<"forUsdt" | "pricePerPoint" | null>(
    null
  );

  const fetchOfferEvents = async () => {
    if (!pointMarketContract) return [];

    try {
      const newResaleOfferEventFilter =
        pointMarketContract.filters.NewResaleOffer(
          null,
          null,
          null,
          null,
          null,
          signer?.address
        );

      const newResaleOfferResults = await pointMarketContract.queryFilter(
        newResaleOfferEventFilter,
        0,
        "latest"
      );

      const fetchedOffers: Offer[] = newResaleOfferResults
        .filter((v: any) => v.args[4] !== 0)
        .map((v: any) => ({
          offerId: Number(v.args[0]),
          offerStatus: Number(v.args[4]),
          blockNumber: v.blockNumber,
          originalOrderId: Number(v.args[1]),
        }));

      fetchedOffers.sort((a, b) => b.blockNumber - a.blockNumber);

      // setOffers(fetchedOffers);
      return fetchedOffers;
    } catch (error) {
      console.error("Error fetching offer events: ", error);
      return [];
    }
  };

  const onClickCreateOffer = async () => {
    if (!pointMarketContract || !signer) return;

    try {
      setLoading(true);

      const offerValue = ethers.parseUnits(Number(forUsdt)?.toString(), 6);
      const reofferStatus = isBuyer ? 2 : 1;

      console.log("resale: ", orderId, offerValue, reofferStatus);
      const tx = await (
        pointMarketContract.connect(signer) as Contract
      ).createResaleOffer(orderId, offerValue, reofferStatus);

      const txResult = await tx.wait();

      console.log(txResult);

      // 오퍼 업데이트
      fetchData();
    } catch (error) {
      console.error("Error creating resale offer:", error);
    } finally {
      setLoading(false);
    }
  };

  // cancelOffer함수 실행
  const onClickCancelOffer = async () => {
    if (!pointMarketContract || !signer || offerId === 0) return;

    try {
      setLoading(true);
      if (offerId !== 0) {
        // cancelOffer 함수 실행
        const tx = await pointMarketContract.cancelOffer(offerId);

        // 트랜잭션 완료 대기
        const txResult = await tx.wait();

        console.log(txResult);

        // 오퍼 업데이트
        fetchData();
      }
    } catch (error) {
      console.error("Error canceling offer:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOfferData = async (fetchedOffers: Offer[]) => {
    if (!pointMarketContract) return;

    // 현재 orderId에 해당하는 최신 오퍼 찾기
    const currentOffer = fetchedOffers.find(
      (offer) => Number(offer.originalOrderId) === orderData.orderId
    );

    if (currentOffer) {
      setOfferId(currentOffer.offerId);

      try {
        const res = await pointMarketContract.getOffer(currentOffer.offerId);
        const offerStatus = Number(res[7]);

        // OfferStatus(1) = open
        if (offerStatus === 1) {
          setIsSelling(true);
        } else {
          setIsSelling(false);
        }
      } catch (error) {
        console.error("Error fetching offer data:", error);
        setIsSelling(false);
      }
    } else {
      setIsSelling(false);
    }
  };

  const fetchData = async () => {
    const fetchedOffers = await fetchOfferEvents();
    await getOfferData(fetchedOffers);
  };

  const formatFixed = (result: number) => {
    const resultString = result.toString();
    const formattedResult = resultString.includes(".")
      ? resultString.split(".")[0] +
        "." +
        resultString.split(".")[1].slice(0, 6)
      : resultString;

    return formattedResult;
  };

  useEffect(() => {
    if (!pointMarketContract || !orderData || !signer) return;

    if (orderData.buyer.toLowerCase() === signer.address.toLowerCase()) {
      setIsBuyer(true);
    } else if (
      orderData.seller.toLowerCase() === signer.address.toLowerCase()
    ) {
      setIsBuyer(false);
    }
    fetchData();
  }, [pointMarketContract, orderData, signer]);

  useEffect(() => {
    if (!orderData) {
      setPricePerPoint(null);
      setForUsdt(null);
      return;
    }

    const points = Number(orderData.amount) / WEI6;
    const deposit = (Number(orderData.value) * 2) / USDT_DECIMAL;

    if (updating === "forUsdt") {
      if (!forUsdt) {
        setPricePerPoint(null);
        return;
      }
      const inputValue = Number(forUsdt);
      const calculatedPrice = isBuyer
        ? inputValue / points
        : (deposit - inputValue) / points;
      setPricePerPoint(formatFixed(calculatedPrice));
      setUpdating(null);
    } else if (updating === "pricePerPoint") {
      if (!pricePerPoint) {
        setForUsdt(null);
        return;
      }
      const inputPrice = Number(pricePerPoint);
      const calculatedForUsdt = isBuyer
        ? inputPrice * points
        : deposit - inputPrice * points;
      setForUsdt(calculatedForUsdt.toFixed(2));
      setUpdating(null);
    }
  }, [forUsdt, pricePerPoint, isBuyer, orderData, updating]);

  const handleForUsdtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limitValue = (Number(orderData.value) * 2) / USDT_DECIMAL;

    setUpdating("forUsdt");
    setForUsdt(
      /^[0-9]*\.?[0-9]*$/.test(e.target.value)
        ? Number(e.target.value) >= limitValue
          ? limitValue.toString()
          : e.target.value
        : ""
    );
  };

  const handlePricePerPointChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUpdating("pricePerPoint");
    setPricePerPoint(e.target.value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay bg="rgba(0, 0, 0, 0.5)" />
      <ModalContent bg="#0d1117" minH="600px" minW="900px">
        <ModalHeader>Resell Order</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex w="full" flexDir="row" justifyContent="space-between">
            <Flex maxW="60%" w="full" h="full" rounded="md">
              <Flex
                flexDir="column"
                w="full"
                border="1px solid"
                borderColor="white"
                p={8}
                rounded="lg"
                h="fit-content"
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex gap={4}>
                    <Flex flexDir="column">
                      <Image
                        src="/images/Morph.png"
                        alt="logo"
                        w="60px"
                        h="60px"
                        rounded="full"
                      />
                    </Flex>
                    <Flex flexDir="column" justifyContent="center">
                      <Text fontWeight="bold" fontSize="20px" color="white">
                        GRASS
                      </Text>
                      <Flex gap={1} alignItems="center">
                        <Link href="https://x.com/getMorph_io" target="_blank">
                          <FaTelegramPlane color="white" />
                        </Link>
                        <Link href="https://t.me/fulltime_scam" target="_blank">
                          <FaTwitter color="white" />
                        </Link>
                        <Link
                          href="https://discord.gg/jHKM36qC"
                          target="_blank"
                        >
                          <FaDiscord color="white" />
                        </Link>
                        <Link href="https://app.getMorph.io/" target="_blank">
                          <FaHome color="white" />
                        </Link>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex flexDir="column" mt={4} gap={2}>
                  <Flex w="full" flexDir="column" gap={2}>
                    <Flex
                      direction="column"
                      px="6"
                      py="4"
                      gap="2"
                      bg="gray.700"
                      borderRadius="xl"
                      fontWeight="bold"
                    >
                      <Text display="flex">
                        <Text color="green.500">
                          {isBuyer ? "Buying " : "Selling "}
                        </Text>
                        <Text color="white">
                          {Number(orderData.amount) / WEI6}
                        </Text>
                        <Image
                          src="/images/logo_Morph.png"
                          alt="usdt"
                          width="24px"
                          height="24px"
                        />
                        points
                      </Text>
                      <Text display="flex">
                        <Text color="green.500">COLLATERAL</Text>
                        <Text color="white">
                          {(Number(orderData.value) * 2) / USDT_DECIMAL}
                        </Text>
                        <Image
                          src="/images/logo_USDT.png"
                          alt="usdt"
                          width="24px"
                          height="24px"
                        />
                      </Text>
                    </Flex>
                  </Flex>

                  {/* Price Per Point 섹션 */}
                  <Flex
                    w="full"
                    alignItems="center"
                    justifyContent="space-between"
                    border="1px solid"
                    borderColor="white"
                    px={4}
                    py={6}
                    rounded="lg"
                  >
                    <Flex gap={4} alignItems="center">
                      <Box
                        bgColor="#2C2C2C"
                        p={1}
                        rounded="md"
                        width="110px"
                        textAlign="center"
                      >
                        <Text fontSize="12px" fontWeight="bold" color="#D3E5D5">
                          Price Per Point
                        </Text>
                      </Box>
                      <Input
                        placeholder="Enter amount"
                        value={pricePerPoint || ""}
                        onChange={handlePricePerPointChange}
                        color="white"
                        width="240px"
                        bg="#2C2C2C"
                        border="none"
                        _placeholder={{ color: "#606064" }}
                      />
                    </Flex>
                    <Box>
                      <Image
                        src="/images/Morph.png"
                        alt="Morph"
                        rounded="full"
                        w="44px"
                        h="44px"
                      />
                    </Box>
                  </Flex>

                  {/* FOR 섹션과 입력 필드 */}
                  <Flex
                    w="full"
                    alignItems="center"
                    justifyContent="space-between"
                    border="1px solid"
                    borderColor="white"
                    px={4}
                    py={6}
                    rounded="lg"
                  >
                    <Flex gap={4} alignItems="center">
                      <Box
                        bgColor="#2C2C2C"
                        p={1}
                        rounded="md"
                        width="110px"
                        textAlign="center"
                      >
                        <Text fontSize="12px" fontWeight="bold" color="#D3E5D5">
                          FOR
                        </Text>
                      </Box>
                      <Input
                        placeholder="Enter amount"
                        value={forUsdt || ""}
                        onChange={handleForUsdtChange}
                        color="white"
                        width="240px"
                        bg="#2C2C2C"
                        border="none"
                        _placeholder={{ color: "#606064" }}
                      />
                    </Flex>
                    <Box>
                      <Image
                        src="/images/usdt.png"
                        alt="usdt"
                        rounded="full"
                        w="40px"
                        h="40px"
                      />
                    </Box>
                  </Flex>
                </Flex>
                <Flex mt={4} flexDir="column">
                  <Flex flexDir="column" mt={4}>
                    <Text fontWeight="bold" color="white">
                      {`You are selling your rights of ${
                        isBuyer ? "Buying" : "Selling"
                      } Morph Points for `}
                      {pricePerPoint
                        ? `${pricePerPoint} USDT per point.`
                        : "N/A"}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
            <Flex w="36%" border="1px solid" borderColor="white" rounded="lg">
              <Flex w="full" m={4}>
                <Text color="white">Description</Text>
              </Flex>
            </Flex>
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button
            flex={1}
            colorScheme="blue"
            isLoading={loading}
            isDisabled={loading}
            onClick={() => {
              if (!isSelling) {
                onClickCreateOffer();
              } else {
                onClickCancelOffer();
              }
            }}
            bgColor={isSelling ? "red.400" : "green.200"}
            color="black"
            _hover={{ bg: isSelling ? "red.300" : "yellow.300" }}
          >
            {loading
              ? "Loading..."
              : isSelling
              ? "Cancel Offer"
              : "Sell Your Order"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ResaleModal;
