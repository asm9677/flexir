"use client";
import {
  Box,
  Button,
  Center,
  ChakraProvider,
  Circle,
  Flex,
  HStack,
  Input,
  Spacer,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";

const CreateOffer = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [market, setMarket] = useState<string | null>("point");
  const [isSell, setIsSell] = useBoolean(false);
  const [pricePerPoint, setPricePerPoint] = useState<number | null>(null);
  const [buying, setBuying] = useState<number | null>(null);
  const [forUsdt, setForUsdt] = useState<number | null>(null);

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

  const onClickBack = () => {};

  const onClickNext = () => {
    setCurrentPage(2);
  };

  return (
    <ChakraProvider>
      <Box w="100%" h="100%">
        <Flex w="100%" px="10px" pt="20px" justifyContent="center">
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
        </Flex>
      </Box>
    </ChakraProvider>
  );
};

export default CreateOffer;
