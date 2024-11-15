import { Flex, Table, TableContainer, Tbody, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { FC } from "react";

const OfferHistory: FC = () => {
    return <Flex h="fit-content" w="full">
    <Flex
      w="full"
      mt={14}
      h="full"
      rounded="lg"
      border="1px solid"
      borderColor="green.700"
      flexDir="column"
      p={6}
      bgColor={"red"}
    >
      <Flex mb={4}>
        <Text fontWeight="bold" textColor="white" fontSize="18px">
          Trade History
        </Text>
      </Flex>
      
    </Flex>
  </Flex>
}

export default OfferHistory;