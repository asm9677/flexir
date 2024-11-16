
import { Box, Flex} from "@chakra-ui/react";
import React, { FC, } from "react";
import OfferInfo from "./OfferInfo";
import OfferHistory from "./OfferHistory";

interface NavButtonProps {
}

const OfferTradeWidget: FC<NavButtonProps> = ({
}) => {
  return (
    <Box width={"1024px"} mx="auto">
        <Flex flexDir="column" mx="auto" mt="3%" pb={"50px"}>
          <Flex gap="4%" w="full" justifyContent="center" alignItems="center">
            
              <OfferTradeWidget />
              <OfferInfo />
          </Flex>
            <OfferHistory />
        </Flex>
    </Box>
  );
};

export default OfferTradeWidget;
