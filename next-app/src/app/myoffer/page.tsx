"use client";

import {
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "@/context/AccountProvider";
import { Contract } from "ethers";
import { contracts } from "@/contracts/addresses";
import { getOfferEvents, getOrderEvents } from "@/features/events";
import MyOffersTab from "@/components/myoffer/MyOffersTab";
import MyOrdersTab from "@/components/myoffer/MyOrdersTab";

export default function Page() {
  const { signer } = useAccount();

  const [mainTabIndex, setMainTabIndex] = useState<number>(0); // 0: My Offers, 1: My Orders
  const [subTabIndex, setSubTabIndex] = useState<number>(0); // Sub-tabs for each main tab
  const [pointMarketContract, setPointMarketContract] =
    useState<Contract | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      if (subTabIndex === 0) {
        return offer.offerStatus === 1;
      } else if (subTabIndex === 1) {
        return offer.offerStatus === 2;
      }
      return true;
    });
  }, [offers, subTabIndex]);

  const fetchEvents = async () => {
    if (!pointMarketContract || !signer) return;

    const [offers, orders] = await Promise.all([
      getOfferEvents(pointMarketContract, signer.address),
      getOrderEvents(pointMarketContract, signer.address),
    ]);

    setOffers(offers);
    setOrders(orders);
  };

  useEffect(() => {
    if (!signer) return;

    const pointMarketCtr = new Contract(
      contracts.flexir.address,
      contracts.flexir.abi,
      signer
    );

    setPointMarketContract(pointMarketCtr);
  }, [signer]);

  useEffect(() => {
    if (!pointMarketContract || !signer) return;

    fetchEvents();
  }, [pointMarketContract, signer]);

  return (
    <Flex h="100vh" color="white" flexDir="column" alignItems="center">
      <Tabs
        index={mainTabIndex}
        colorScheme="white"
        onChange={(index) => {
          setMainTabIndex(index);
          setSubTabIndex(0);
        }}
        variant="enclosed"
        w="100%"
        maxW="1280px"
        px={10}
        mt={2}
      >
        <TabList borderColor={"green.700"}>
          <Tab>My Offers</Tab>
          <Tab>My Positions</Tab>
        </TabList>

        <TabPanels>
          {/* My Offers Tab */}
          <TabPanel>
            <MyOffersTab
              subTabIndex={subTabIndex}
              setSubTabIndex={setSubTabIndex}
              offers={offers}
              setOffers={setOffers}
              filteredOffers={filteredOffers}
              pointMarketContract={pointMarketContract}
            />
          </TabPanel>

          {/* My Orders Tab */}
          <TabPanel>
            <MyOrdersTab
              subTabIndex={subTabIndex}
              setSubTabIndex={setSubTabIndex}
              orders={orders}
              setOrders={setOrders}
              offers={offers}
              pointMarketContract={pointMarketContract}
              signer={signer}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
}
