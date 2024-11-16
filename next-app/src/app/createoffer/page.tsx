"use client";
import {
  Avatar,
  Box,
  Button,
  Center,
  Circle,
  Flex,
  HStack,
  Image,
  Input,
  Spacer,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { FaAngleDown } from "react-icons/fa";
import { useAccount } from "@/context/AccountProvider";
import { useContract } from "@/hooks/useContract";
import { useRouter } from "next/navigation";
import { keyframes } from "@emotion/react";
import { notify, tokens, coins } from "@/lib";
import { onClickDeposit } from "@/utils/newOffer";

const CreateOffer = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [market, setMarket] = useState<string | null>("point");
  const [isSell, setIsSell] = useBoolean(false);
  const [pricePerPoint, setPricePerPoint] = useState<number | null>(null);
  const [buying, setBuying] = useState<number | null>(null);
  const [forUsdt, setForUsdt] = useState<number | null>(null);
  const [isTokenOpen, setisTokenOpen] = useState<boolean>(false);
  const [isCoinOpen, setisCoinOpen] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<number>(1);
  const [selectedCoin, setSelectedCoin] = useState<number>(1);
  const [newOfferLoading, setNewOfferLoading] = useState<boolean>(false);
  const [isSameDomain, setIsSameDomain] = useState(false);

  const { signer, chainId } = useAccount();
  const { flexirContract, usdtContract } = useContract();
  const router = useRouter();

  const pricePerPointRef = useRef<HTMLInputElement>(null);
  const buyingRef = useRef<HTMLInputElement>(null);
  const forUsdtRef = useRef<HTMLInputElement>(null);

  const handleMarketChange = (newMarket: string) => {
    setMarket(newMarket);
  };

  const handlePricePerPointChange = (value: string) => {
    const pricePerPointValue = parseFloat(value);
    setPricePerPoint(pricePerPointValue);
    if (buying !== null && !isNaN(pricePerPointValue)) {
      setForUsdt(pricePerPointValue * buying);
    }
  };

  const handleBuyingChange = (value: string) => {
    const buyingValue = parseFloat(value);
    setBuying(buyingValue);
    if (!isNaN(buyingValue)) {
      if (pricePerPoint !== null) {
        setForUsdt(buyingValue * pricePerPoint);
      } else if (forUsdt !== null) {
        setPricePerPoint(forUsdt / buyingValue);
      }
    }
  };

  const handleForUsdtChange = (value: string) => {
    const forUsdtValue = parseFloat(value);
    setForUsdt(forUsdtValue);
    if (buying !== null && !isNaN(forUsdtValue)) {
      setPricePerPoint(forUsdtValue / buying);
    }
  };

  const handleTokenChange = (index: number) => {
    setSelectedToken(index);
    setisTokenOpen(false);
  };

  const handleCoinChange = (index: number) => {
    setSelectedCoin(index);
    setisCoinOpen(false);
  };

  const getTokenImage = (tokenId: number) => {
    const token = tokens.find((token) => token.id === tokenId);
    return token ? token.src : undefined;
  };

  const getCoinImage = (coinId: number) => {
    const coin = coins.find((coin) => coin.id === coinId);
    return coin ? coin.src : undefined;
  };

  const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

  const onClickBack = () => {
    if (isSameDomain) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const onClickNext = () => {
    if (pricePerPoint === null) {
      notify("Price per Point is required", false);
      pricePerPointRef.current?.focus();
      return;
    }

    if (buying === null) {
      notify("Buying amount is required", false);
      buyingRef.current?.focus();
      return;
    }

    if (forUsdt === null) {
      notify("For USDT value is required", false);
      forUsdtRef.current?.focus();
      return;
    }

    setCurrentPage(2);
  };

  return (
    <Box w="100%" h="100%">
      <Flex w="100%" px="10px" pt="20px" justifyContent="center">
        {currentPage === 1 && (
          <Center w="100%">
            <Flex w="100%" alignItems="stretch" maxW="900px" h="100%">
              <Flex
                flex="4"
                w="50%"
                minW="472px"
                px="2"
                py="5"
                border="1px"
                borderColor="green.700"
                borderRadius="xl"
                direction="column"
                mr="3"
              >
                <Flex>
                  <Box display="flex" gap="2">
                    <Button
                      onClick={() => handleMarketChange("point")}
                      bg={market === "point" ? "teal.800" : "gray.700"}
                      border={"1px solid"}
                      borderColor={"green.200"}
                      color="green.200"
                      _hover={{
                        bg: market === "point" ? "teal.800" : "gray.700",
                      }}
                      fontSize="small"
                      p="2"
                      h="8"
                    >
                      Point Market
                    </Button>
                    <Button
                      // onClick={() => handleMarketChange("pre")}
                      bg={market === "pre" ? "green.200" : "gray.800"}
                      color="gray.500"
                      _hover={{
                        bg: market === "pre" ? "green.200" : "gray.800",
                      }}
                      border={"1px solid"}
                      borderColor={"gray.500"}
                      fontSize="small"
                      p="2"
                      h="8"
                      cursor="not-allowed"
                      disabled
                    >
                      Pre Market
                    </Button>
                    <Button
                      // onClick={() => handleMarketChange("OTC")}
                      bg={market === "OTC" ? "green.200" : "gray.800"}
                      color="gray.500"
                      _hover={{
                        bg: market === "OTC" ? "green.200" : "gray.7800",
                      }}
                      border={"1px solid"}
                      borderColor={"gray.500"}
                      fontSize="small"
                      p="2"
                      h="8"
                      cursor="not-allowed"
                      disabled
                    >
                      OTC Market
                    </Button>
                  </Box>
                  <Spacer />
                </Flex>
                <Center mt="9">
                  <HStack spacing="0">
                    <Button
                      py={3}
                      onClick={setIsSell.off}
                      bg={!isSell ? "green.200" : "gray.800"}
                      color={!isSell ? "black" : "gray.500"}
                      _hover={{ bg: !isSell ? "green.200" : "gray.800" }}
                      borderRadius="full"
                      borderRightRadius="0"
                      width="100px"
                      h="7"
                    >
                      Buy
                    </Button>
                    <Button
                      onClick={setIsSell.on}
                      py={3}
                      bg={isSell ? "green.200" : "gray.800"}
                      color={isSell ? "black" : "gray.500"}
                      _hover={{ bg: isSell ? "green.200" : "gray.800" }}
                      borderRadius="full"
                      borderLeftRadius="0"
                      width="100px"
                      h="7"
                    >
                      Sell
                    </Button>
                  </HStack>
                </Center>
                <Flex
                  alignItems="center"
                  mt="5"
                  border="1px solid gray"
                  borderColor={"green.700"}
                  borderRadius="lg"
                  px="3"
                  py="2"
                >
                  <Flex w="130px">
                    <Box px="2" py="1" rounded="md">
                      <Text
                        color={"gray.100"}
                        fontSize="12px"
                        fontWeight="bold"
                      >
                        PRICE PER POINT
                      </Text>
                    </Box>
                  </Flex>
                  <Input
                    type="number"
                    border="0"
                    w="auto"
                    fontWeight={"bold"}
                    color="white"
                    _focus={{
                      boxShadow: "none",
                      outline: "none",
                      border: "none",
                    }}
                    value={pricePerPoint ?? ""}
                    onChange={(e) => {
                      handlePricePerPointChange(e.target.value);
                    }}
                    placeholder="0.001"
                    ref={pricePerPointRef}
                  />
                </Flex>
                <Flex
                  alignItems="center"
                  mt="2"
                  border="1px solid"
                  borderColor={"green.700"}
                  borderRadius="lg"
                  px="3"
                  py="2"
                >
                  <Flex w="130px">
                    <Box px="2" py="1" rounded="md">
                      <Text
                        color={"gray.100"}
                        fontSize="12px"
                        fontWeight="bold"
                      >
                        {isSell ? "SELLING" : "BUYING"}
                      </Text>
                    </Box>
                  </Flex>
                  <Input
                    type="number"
                    border="0"
                    w="60%"
                    fontWeight={"bold"}
                    _focus={{
                      boxShadow: "none",
                      outline: "none",
                      border: "none",
                    }}
                    color="white"
                    value={buying ?? ""}
                    onChange={(e) => handleBuyingChange(e.target.value)}
                    placeholder="10"
                    ref={buyingRef}
                  />
                  <Flex>
                    <Avatar
                      boxSize="52px"
                      name={`${selectedToken} Logo`}
                      src={getTokenImage(selectedToken)}
                      w="40px"
                      h="40px"
                    />
                    <Flex flexDir="column" ml="-16px">
                      <Box>
                        <Button
                          onClick={() => setisTokenOpen((prev) => !prev)}
                          rightIcon={<FaAngleDown />}
                          variant="white"
                        ></Button>

                        {isTokenOpen && (
                          <Box
                            border="1px solid"
                            borderColor={"green.700"}
                            _hover={{ backgroundColor: "gray.800" }}
                            borderRadius="md"
                            bg="black"
                            color="white"
                            position="absolute"
                            minW="150px"
                            zIndex={1}
                            my="-4px"
                          >
                            {tokens.map((token) => (
                              <Box
                                key={token.id}
                                px={4}
                                py={2}
                                gap={2}
                                _hover={{ bg: "gray.700", cursor: "pointer" }}
                                onClick={() => handleTokenChange(token.id)}
                              >
                                {token.name}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex
                  alignItems="center"
                  mt="2"
                  border="1px solid"
                  borderColor={"green.700"}
                  borderRadius="lg"
                  px="3"
                  py="2"
                >
                  <Flex w="130px">
                    <Box color="gray.100" px="2" py="1" rounded="md">
                      <Text fontSize="12px" fontWeight="bold">
                        FOR
                      </Text>
                    </Box>
                  </Flex>
                  <Input
                    type="number"
                    border="0"
                    w="60%"
                    color="white"
                    fontWeight={"bold"}
                    _focus={{
                      boxShadow: "none",
                      outline: "none",
                      border: "none",
                    }}
                    value={forUsdt ?? ""}
                    onChange={(e) => handleForUsdtChange(e.target.value)}
                    placeholder="0.01"
                    ref={forUsdtRef}
                  />
                  <Flex>
                    <Avatar
                      boxSize="52px"
                      name={`${selectedCoin} Logo`}
                      src={getCoinImage(selectedCoin)}
                      w="40px"
                      h="40px"
                    />

                    <Flex flexDir="column" ml="-16px">
                      <Box>
                        <Button
                          onClick={() => setisCoinOpen((prev) => !prev)}
                          rightIcon={<FaAngleDown />}
                          variant="white"
                        >
                          {/* <Box display="flex" alignItems="center">
                              <Text ml={4} color="white" h="fit-content">
                                {selectedCoin}
                              </Text>
                            </Box> */}
                        </Button>

                        {isCoinOpen && (
                          <Box
                            border="1px solid"
                            borderColor="green.700"
                            _hover={{ backgroundColor: "gray.800" }}
                            borderRadius="md"
                            bg="black"
                            color="white"
                            position="absolute"
                            minW="150px"
                            zIndex={1}
                            my="-4px"
                          >
                            {coins.map((coin) => (
                              <Box
                                key={coin.id}
                                px={4}
                                py={2}
                                _hover={{ bg: "gray.700", cursor: "pointer" }}
                                onClick={() => handleCoinChange(coin.id)}
                              >
                                {coin.name}
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Flex>
                  </Flex>
                </Flex>
                <Center>
                  <Flex mt="5" gap="3">
                    <Button w="180px" onClick={() => onClickBack()}>
                      Back
                    </Button>
                    <Button
                      w="180px"
                      textColor="dark"
                      bgColor={"green.200"}
                      _hover={{ bg: "green.200" }}
                      onClick={() => onClickNext()}
                    >
                      Next
                    </Button>
                  </Flex>
                </Center>
              </Flex>
              <Box
                position="relative"
                bgColor="dark"
                border={"1px solid"}
                borderColor={"green.700"}
                borderRadius="full"
                p="1"
                m="1"
              >
                <Circle
                  size="6"
                  color={"dark"}
                  position="absolute"
                  top="20%"
                  left="-2"
                  bg="green.200"
                  fontWeight="bold"
                >
                  1
                </Circle>
              </Box>
              <Flex
                flex="2"
                ml="3"
                px="3"
                py="5"
                h="100%"
                minW="183px"
                border="1px"
                borderColor="green.700"
                borderRadius="xl"
                direction="column"
              >
                <Flex
                  flex="1"
                  borderBottom="1px"
                  borderColor="gray.600"
                  color="white"
                >
                  <Box p="2" fontSize="sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </Box>
                </Flex>
                <Flex flex="1" fontSize="sm" color="gray.600">
                  <Box p="2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </Box>
                </Flex>
              </Flex>
            </Flex>
          </Center>
        )}

        {currentPage === 2 && (
          <Center w="100%">
            <Flex w="100%" alignItems="stretch" maxW="1000px" h="100%">
              <Flex
                flex="4"
                w="50%"
                minW="472px"
                px="2"
                py="5"
                border="2px"
                borderColor="green.700"
                borderRadius="xl"
                direction="column"
                mr="3"
              >
                <Flex
                  direction="column"
                  px="6"
                  py="4"
                  gap="2"
                  bg="gray.700"
                  borderRadius="xl"
                  fontWeight="bold"
                >
                  <Text display="flex" color="white">
                    <Text color="gray.500">1 point =&nbsp;</Text> $
                    {pricePerPoint?.toLocaleString(undefined, {
                      maximumFractionDigits: 10,
                    })}
                  </Text>
                  <Text display="flex" color="white">
                    <Text color="green.200">
                      {isSell ? "Sell" : "Buy"}&nbsp;
                    </Text>
                    {buying?.toLocaleString(undefined, {
                      maximumFractionDigits: 10,
                    })}
                    &nbsp;
                    <Image
                      src="/images/logo_token.png"
                      alt="token"
                      width="24px"
                      height="24px"
                    />
                    &nbsp;points
                  </Text>
                  <Text display="flex" color="white">
                    <Text color="green.200">for&nbsp;</Text>
                    {forUsdt?.toLocaleString(undefined, {
                      maximumFractionDigits: 10, // 최대 4자리 소수점
                    })}
                    &nbsp;&nbsp;
                    <Image
                      src="/images/logo_USDT.png"
                      alt="usdt"
                      width="24px"
                      height="24px"
                    />
                  </Text>
                </Flex>
                <Center
                  w="100%"
                  h="200px"
                  p="3"
                  mt="5"
                  border="1px"
                  borderColor="green.700"
                  borderRadius="lg"
                  color="white"
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                  cupidatat non proident, sunt in culpa qui officia deserunt
                  mollit anim id est laborum.
                </Center>

                <Flex w="100%" mt="5">
                  <Button
                    w="100%"
                    bgColor="green.200"
                    textColor="black"
                    _hover={{ bg: "green.200" }}
                    onClick={() =>
                      onClickDeposit(
                        flexirContract,
                        signer,
                        isSell,
                        buying,
                        forUsdt,
                        usdtContract,
                        setNewOfferLoading,
                        router
                      )
                    }
                    sx={{
                      animation: newOfferLoading
                        ? `${pulse} 1.5s infinite`
                        : "none",
                    }}
                  >
                    {newOfferLoading ? (
                      "Loading..."
                    ) : (
                      <>
                        {`DEPOSIT ${forUsdt?.toLocaleString()} USDT`}
                        <Image
                          src="/images/logo_USDT.png"
                          alt="usdt"
                          width="24px"
                          height="24px"
                          ml="1"
                        />
                      </>
                    )}
                  </Button>
                </Flex>
              </Flex>
              <Box
                position="relative"
                bgColor="dark"
                border={"1px solid"}
                borderColor={"green.700"}
                borderRadius="full"
                p="1"
                m="1"
              >
                <Circle
                  size="6"
                  position="absolute"
                  top="70%"
                  color={"dark"}
                  left="-2"
                  bg="green.200"
                  fontWeight="bold"
                >
                  2
                </Circle>
              </Box>
              <Flex
                flex="2"
                ml="3"
                px="3"
                py="5"
                w="100%"
                h="100%"
                minW="183px"
                border="2px"
                borderColor="green.700"
                borderRadius="xl"
                direction="column"
              >
                <Flex
                  flex="1"
                  color="gray.600"
                  borderBottom="1px"
                  borderColor="green.700"
                >
                  <Box p="2" fontSize="sm">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </Box>
                </Flex>
                <Flex flex="1">
                  <Box p="2" fontSize="sm" color="white">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </Box>
                </Flex>
              </Flex>
            </Flex>
          </Center>
        )}
      </Flex>
    </Box>
  );
};

export default CreateOffer;
