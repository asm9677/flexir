
import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import { formatUnits } from "ethers";
import Link from "next/link";
import React, { FC } from "react";
import { FaDiscord, FaHome, FaTelegramPlane, FaTwitter } from "react-icons/fa";
import { FaArrowDownLong } from "react-icons/fa6";

import OfferInputBox from "../molecules/OfferInputBox";

interface NavButtonProps {
}

const OfferTradeWidget: FC<NavButtonProps> = ({
  
}) => {

  return (
    <Flex maxW="60%" w="full" rounded="md">
      <Box
        w="full"
        border="1px solid"
        borderColor="green.700"
        px={6}
        pt={6}
        pb={2}
        rounded="lg"
        h="500px"
      >
        <Flex flexDir="column">
          <Flex alignItems={"center"} gap={4}>
            <Image
              src=""
              alt="logo"
              w="60px"
              h="60px"
              rounded="full"
            />
            <Flex flexDirection={"column"}>
              <Text fontWeight="bold" fontSize="18px" textColor="white">
                POINTS
              </Text>
              <Flex gap={1} alignItems="center">
                <Link href="https://x.com/getgrass_io" target="_blank">
                  <FaTelegramPlane color="white" />
                </Link>
                <Link href="https://t.me/fulltime_scam" target="_blank">
                  <FaTwitter color="white" />
                </Link>
                <Link href="https://discord.gg/jHKM36qC" target="_blank">
                  <FaDiscord color="white" />
                </Link>
                <Link href="https://app.getgrass.io/" target="_blank">
                  <FaHome color="white" />
                </Link>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex flexDir="column" mt={5} gap={3}>
          <OfferInputBox
            src=""
            name="PRICE"
            value={123n}
          />
          <Flex justifyContent={"center"}>
            <FaArrowDownLong color={"#ECECEC"} />
          </Flex>
          <OfferInputBox
            src=""
            name="POINTS"
            value={123n}
          />
        </Flex>
        <Flex mt={8} flexDir="column" justifyContent={"flex-start"}>
          
        </Flex>
        <Flex flexDir="column" mt={4} fontSize={"small"}>
          <Text textColor="white" fontWeight="bold">
            <Box
              as="span"
              color="green.100" 
            >
              BUYING
            </Box>{" "}
            123 POINTS{" "}
            <Box as="span" color="#606064">
              for
            </Box>{" "}
            123 USDT.
          </Text>
          <Text fontWeight="bold" textColor="white">
            <Box as="span" color="#606064">
              You will automatically receive
            </Box>{" "}
            GRASS{" "}
            <Box as="span" color="#606064">
              token after settlement.
            </Box>
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

export default OfferTradeWidget;
