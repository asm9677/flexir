import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Grid,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { FaAngleDown } from "react-icons/fa";
import MyOrderCard from "@/components/myoffer/MyOrderCard";
import { Contract } from "ethers";

interface MyOrdersTabProps {
  subTabIndex: number;
  setSubTabIndex: (index: number) => void;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  offers: Offer[];
  pointMarketContract: Contract | null;
  signer: any;
}

export default function MyOrdersTab({
  subTabIndex,
  setSubTabIndex,
  orders,
  setOrders,
  offers,
  pointMarketContract,
  signer,
}: MyOrdersTabProps) {
  const sortOrders = (descending: boolean) => {
    const sorted = [...orders].sort((a, b) =>
      descending
        ? Number(b.blockNumber) - Number(a.blockNumber)
        : Number(a.blockNumber) - Number(b.blockNumber)
    );
    setOrders(sorted);
  };

  return (
    <>
      <Flex justifyContent="space-between" w="100%" mt={2}>
        <Box borderRadius="md" boxShadow="md" h={10}>
          <ButtonGroup isAttached>
            <Button
              onClick={() => setSubTabIndex(0)}
              bg={subTabIndex === 0 ? "green.200" : "gray.700"}
              color={subTabIndex === 0 ? "black" : "white"}
              borderRightRadius="none"
              borderLeftRadius="md"
              px={6}
              _hover={{
                bg: subTabIndex === 0 ? "green.200" : "gray.700",
              }}
              _focus={{ boxShadow: "none" }}
              h={8}
              fontSize="14px"
            >
              Buyer
            </Button>
            <Button
              onClick={() => setSubTabIndex(1)}
              bg={subTabIndex === 1 ? "green.200" : "gray.700"}
              color={subTabIndex === 1 ? "black" : "white"}
              borderLeftRadius="none"
              borderRightRadius="md"
              px={6}
              _hover={{
                bg: subTabIndex === 1 ? "green.200" : "gray.700",
              }}
              _focus={{ boxShadow: "none" }}
              h={8}
              fontSize="14px"
            >
              Seller
            </Button>
          </ButtonGroup>
        </Box>

        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<FaAngleDown />}
            bg="gray.700"
            color="white"
            _hover={{ bg: "gray.700" }}
            fontSize="sm"
            fontWeight="medium"
            px={3}
            h={9}
          >
            Sorting Type
          </MenuButton>
          <MenuList bg="gray.700" border="none">
            <MenuItem
              bg="gray.700"
              _hover={{ bg: "gray.700" }}
              color="white"
              onClick={() => sortOrders(false)}
            >
              Created: Descending
            </MenuItem>
            <MenuItem
              bg="gray.700"
              _hover={{ bg: "gray.700" }}
              color="white"
              onClick={() => sortOrders(true)}
            >
              Created: Ascending
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={6}
        w="100%"
        py={8}
      >
        {orders.map((v) => (
          <MyOrderCard
            key={Number(v.orderId)}
            order={v}
            offers={offers}
            pointMarketContract={pointMarketContract}
            signer={signer}
            subTabIndex={subTabIndex}
          />
        ))}
      </Grid>
    </>
  );
}
