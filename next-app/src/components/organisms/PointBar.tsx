"use client";

import { useAccount } from "@/context/AccountProvider";
import { useContract } from "@/hooks/useContract";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { Contract } from "ethers";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

const getBlockTimeInterval = (chainId: number) => {
  switch (chainId) {
    case 111555111:
      return 12;
    default:
      return 1;
  }
};

export const PointBar: FC = () => {
  const { provider, chainId } = useAccount();
  const { flexirContract } = useContract();

  const router = useRouter();
  const [selectedToken, setSelectedToken] = useState<number>(0);
  const [volume, setVolume] = useState<number[]>([]);
  const [volume7, setVolume7] = useState<number>();
  const [contract, setContract] = useState<Contract | null>(null);

  const tokens = [
    {
      id: 1,
      name: "token",
      src: "",
    },
  ];

  const getTokenName = (id: number) => {
    switch (id) {
      case 1:
        return "token";
      default:
        return "all";
    }
  };
  const getEventsByDay = async (days: number, blockTimeInterval: number) => {
    const latestBlock = await provider!.getBlock("latest");
    const latestBlockNumber = latestBlock!.number;
    const fromBlockNumber =
      latestBlockNumber - (86400 / blockTimeInterval) * days;

    const newOfferEvents = await contract!.queryFilter(
      "NewOffer",
      fromBlockNumber,
      "latest"
    );
    const newResaleOfferEvents = await contract!.queryFilter(
      "NewResaleOffer",
      fromBlockNumber,
      "latest"
    );

    const sumOffer = newOfferEvents.reduce((sum, event) => {
      if ("args" in event && event.args) {
        return sum + Number(event.args[5]) / 10 ** 6;
      }
      return sum;
    }, 0);
    const sumResaleOffer = newResaleOfferEvents.reduce((sum, event) => {
      if ("args" in event && event.args) {
        return sum + Number(event.args[3]) / 10 ** 6;
      }
      return sum;
    }, 0);

    if (days === 1) {
      setVolume([
        sumOffer + sumResaleOffer,
        newOfferEvents.length + newResaleOfferEvents.length,
      ]);
    } else {
      setVolume7(sumOffer + sumResaleOffer);
    }
  };

  useEffect(() => {
    if (contract !== null || !provider) return;
    console.log("provider", provider);
    setContract(flexirContract);
  }, [provider]);

  useEffect(() => {
    router.push(`/?token=${getTokenName(selectedToken)}`);
  }, [selectedToken]);

  useEffect(() => {
    if (contract === null) return;
    console.log(contract);
    getEventsByDay(1, getBlockTimeInterval(chainId));
    getEventsByDay(7, getBlockTimeInterval(chainId));
  }, [contract]);

  return (
    <Flex
      h="80px"
      mx="auto"
      w="1240px"
      my={6}
      justifyContent="space-between"
      alignItems="center"
      color="white"
    >
      <Flex justifyContent="space-between" alignItems="center" gap={4}>
        <Flex width={"250px"}>
          {selectedToken === 0 ? (
            <Box
              width="14"
              height="14"
              bgGradient="linear(to-br, green.300, teal.400, purple.500)"
              rounded="full"
            />
          ) : (
            <Avatar
              boxSize="52px"
              name={`${getTokenName(selectedToken)} Logo`}
              src={`/images/${getTokenName(selectedToken)}.png`}
            />
          )}

          <Menu>
            {({ isOpen }) => (
              <>
                <MenuButton
                  display="flex"
                  mt="8px"
                  isActive={isOpen}
                  as={Button}
                  variant={"transparent"}
                  rightIcon={<IoIosArrowDown />}
                >
                  {selectedToken === 0
                    ? "All Tokens"
                    : tokens.filter((t) => t.id === selectedToken)[0].name}
                </MenuButton>
                <MenuList bgColor={"gray.700"} fontSize={"sm"} minWidth="200px">
                  <MenuItem onClick={() => setSelectedToken(0)}>
                    All Tokens
                  </MenuItem>
                  {tokens.map((el) => (
                    <MenuItem
                      key={el.id}
                      onClick={() => setSelectedToken(el.id)}
                    >
                      {el.name}
                    </MenuItem>
                  ))}
                </MenuList>
              </>
            )}
          </Menu>
        </Flex>
        <Flex gap={"32"} borderRadius={"lg"} py="20px" px="32px">
          <Flex flexDir="column">
            <Box fontSize="12px">Floor Price</Box>
            <Flex
              alignItems="flex-end"
              justifyContent="center"
              lineHeight="30px"
              gap={1}
            >
              <Box fontSize="20px" fontWeight="bold">
                {volume7 && Number(volume7?.toFixed(2)).toLocaleString()}
              </Box>
              <Box>USDT</Box>
            </Flex>
          </Flex>
          <Flex flexDir="column">
            <Box fontSize="12px">7d Volume</Box>
            <Flex
              alignItems="flex-end"
              justifyContent="center"
              lineHeight="30px"
              gap={1}
            >
              <Box fontSize="20px" fontWeight="bold">
                {volume7 && Number(volume7?.toFixed(2)).toLocaleString()}
              </Box>
              <Box>USDT</Box>
            </Flex>
          </Flex>

          <Flex flexDir="column">
            <Box fontSize="12px">24h Volume</Box>
            <Flex
              alignItems="flex-end"
              justifyContent="center"
              lineHeight="30px"
              gap={1}
            >
              <Box fontSize="20px" fontWeight="bold">
                {volume[0] && Number(volume[0]?.toFixed(2)).toLocaleString()}
              </Box>
              <Box>USDT</Box>
            </Flex>
          </Flex>

          <Flex flexDir="column">
            <Box fontSize="12px">24h New Orders</Box>
            <Flex
              alignItems="flex-end"
              justifyContent="center"
              lineHeight="30px"
              gap={1}
            >
              <Box fontSize="20px" fontWeight={"bold"}>
                {volume[1] && Number(volume[1])?.toString()}
              </Box>
              <Box>Orders</Box>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Button
        fontSize="14px"
        h="36px"
        bgColor="green.200"
        _hover={{ bg: "green.200" }}
        color={"dark"}
        onClick={() => router.push("/createoffer")}
      >
        + Create Offer
      </Button>
    </Flex>
  );
};