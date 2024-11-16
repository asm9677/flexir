import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { formatUnits } from "ethers";
import React, { FC } from "react";

interface OfferInputBoxProps {
  src: string;
  name: string;
  value: bigint;
}

const OfferInputBox: FC<OfferInputBoxProps> = ({ src, name, value }) => {
  return (
    <Flex
      pt={"10px"}
      pb={"6px"}
      pl={"8px"}
      alignItems="center"
      justifyContent="space-between"
      rounded="lg"
      border={"1px solid"}
      borderColor="green.700"
    >
      <Flex gap={4} alignItems="center">
        <Box p={1} rounded="md" width="70px" textAlign="center">
          <Flex justifyContent={"center"} mb={1}>
            <Image src={src} alt={name} rounded="full" w="32px" h="32px" />
          </Flex>
          <Text fontSize="12px" fontWeight="bold" textColor="#D3E5D5">
            {name}
          </Text>
        </Box>
        <Text fontSize="20px" textColor="white" fontWeight="bold">
          {formatUnits(value, 6)}
        </Text>
      </Flex>
    </Flex>
  );
};

export default OfferInputBox;
