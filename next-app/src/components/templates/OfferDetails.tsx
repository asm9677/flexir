"use client";

import { Box, Flex, useDisclosure } from "@chakra-ui/react";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useAccount } from "@/context/AccountProvider";
import { useContract } from "@/hooks/useContract";
import { Contract, ethers } from "ethers";

import OfferHistory from "../organisms/OfferHistory";
import OfferTradeWidget from "../organisms/OfferTradeWidget";
import OfferInfo from "../organisms/OfferInfo";
import ResaleModal from "./ResaleModal";

interface OfferPageProps {
  offerId: string;
}

const OfferDetails: NextPage<OfferPageProps> = ({ offerId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { signer, provider } = useAccount();
  const { flexirContract, usdtContract, tokenContract } = useContract();
  const [offer, setOffer] = useState<IOffer>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [orderId, setOrderId] = useState<number>(0);
  const [collateral, setCollateral] = useState<string>("-");
  const [tradeHistory, setTradeHistory] = useState<ITradeHistory[] | null>([]);
  const [token, setToken] = useState<IToken>();
  const [isSelling, setIsSelling] = useState<boolean>(false);

  const [isSettled, setIsSettled] = useState<boolean>(false);
  const [isClaimed, setIsClaimed] = useState<boolean>(false);
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [settleStatus, setSettleStatus] = useState<string>("Pending");

  const fetchBase = async () => {
    fetchOffer();
    fetchOrder();
    fetchTradeHistory();
  };

  const fetchOffer = async () => {
    if (signer && flexirContract && offerId) {
      try {
        const offer = await flexirContract.getOffer(offerId);
        setOffer(offer);
      } catch (error) {
        console.error("Failed to fetch offer: ", error);
      }
    }
  };

  useEffect(() => {
    if (!signer || !flexirContract) return;
    fetchOffer();
  }, [signer, offerId]);

  const fetchOrder = async () => {
    if (signer && flexirContract && offer) {
      try {
        let events;
        let lastOrderId;
        if (offer.originalOrderId == 0n) {
          events = await flexirContract.queryFilter(
            flexirContract.filters.NewOrder(null, offerId),
            13350000,
            "latest"
          );

          if (events.length > 0) {
            const log = flexirContract.interface.parseLog(events[0]);
            if (log) {
              lastOrderId = log.args[0];
              setCollateral(
                String(ethers.formatUnits(offer.collateral * 2n, 6))
              );
            }
          }
        } else {
          const originalOrder = await flexirContract.getOrder(
            offer.originalOrderId
          );
          const originalOfferId = originalOrder.offerId;

          const originalOffer = await flexirContract.getOffer(originalOfferId);

          setCollateral(
            String(ethers.formatUnits(originalOffer.collateral * 2n, 6))
          );

          const [originalOrderEvents, resaleOfferEvents] = await Promise.all([
            flexirContract.queryFilter(
              flexirContract.filters.NewOrder(null, originalOfferId),
              13350000,
              "latest"
            ),
            flexirContract.queryFilter(
              flexirContract.filters.ResaleOfferFilled(offerId),
              13350000,
              "latest"
            ),
          ]);
          events = [...originalOrderEvents, ...resaleOfferEvents];
          events.sort((a, b) => b.blockNumber - a.blockNumber);
          lastOrderId = offer.originalOrderId;
        }

        setOrderId(lastOrderId);

        if (events.length > 0) {
          const order = await flexirContract.getOrder(lastOrderId);

          const orderMap = {
            offerId: order[0],
            amount: order[1],
            value: order[2],
            seller: order[3],
            buyer: order[4],
            status: order[5],
          };
          setOrder(orderMap);
        }
      } catch (error) {
        console.error("Failed to fetch order: ", error);
      }
    }
  };

  const fetchToken = async () => {
    if (offer) {
      try {
        const token = await flexirContract.getToken(offer.tokenId);
        setToken(token);
      } catch (error) {
        console.error("Failed to fetch token: ", error);
      }
    }
  };

  useEffect(() => {
    if (!offer) return;
    fetchOrder();
    fetchToken();
    fetchTradeHistory();
  }, [offer]);

  useEffect(() => {
    if (!token) return;
    if (token.status == 3) {
      fetchTokenAmount();
    }
  }, [token, order]);

  const formatTimestamp = (blockTimestamp: number) => {
    const blockDate = new Date(Number(blockTimestamp) * 1000);
    const year = blockDate.getUTCFullYear();
    const month = String(blockDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(blockDate.getUTCDate()).padStart(2, "0");
    const hours = String(blockDate.getUTCHours()).padStart(2, "0");
    const minutes = String(blockDate.getUTCMinutes()).padStart(2, "0");

    return `${year}.${month}.${day} ${hours}:${minutes} UTC`;
  };

  const fetchTradeHistory = async () => {
    if (signer && flexirContract && offer && provider) {
      try {
        let events = [];

        const latestBlock = await provider!.getBlock("latest");
        const latestBlockNumber = latestBlock!.number;
        const fromBlockNumber = latestBlockNumber - 4500;

        if (offer.originalOrderId == 0n) {
          events = await flexirContract.queryFilter(
            flexirContract.filters.NewOrder(null, offerId),
            fromBlockNumber,
            "latest"
          );
        } else {
          const originalOrder = await flexirContract.getOrder(
            offer.originalOrderId
          );

          const originalOfferId = originalOrder.offerId;
          const [originalOrderEvents, resaleOfferEvents] = await Promise.all([
            flexirContract.queryFilter(
              flexirContract.filters.NewOrder(null, originalOfferId),
              fromBlockNumber,
              "latest"
            ),
            flexirContract.queryFilter(
              flexirContract.filters.ResaleOfferFilled(offerId),
              fromBlockNumber,
              "latest"
            ),
          ]);
          events = [...originalOrderEvents, ...resaleOfferEvents];
          events.sort((a, b) => b.blockNumber - a.blockNumber);
        }

        const tradeHistory = await Promise.all(
          events.map(async (event) => {
            const block = await provider.getBlock(event.blockNumber);
            const timestamp = formatTimestamp(block!.timestamp);
            const txHash = event.transactionHash;
            const offerId = event.topics[1];

            let seller, buyer;
            const log = flexirContract.interface.parseLog(event);

            if (log) {
              if (log.name === "NewOrder") {
                seller = log.args[4];
                buyer = log.args[5];
              } else if (log.name === "ResaleOfferFilled") {
                seller = log.args[4];
                buyer = log.args[3];
              }
            }

            return {
              timestamp,
              txHash,
              offerId,
              seller,
              buyer,
            };
          })
        );

        setTradeHistory(tradeHistory);
      } catch (error) {
        console.error("Failed to fetch trade history: ", error);
      }
    }
  };

  const fetchSelling = async () => {
    if (signer && flexirContract && order && orderId) {
      try {
        let events = [];

        const latestBlock = await provider!.getBlock("latest");
        const latestBlockNumber = latestBlock!.number;
        const fromBlockNumber = latestBlockNumber - 4500;

        const [NewResaleOfferEvent, cancelOfferEvent] = await Promise.all([
          flexirContract.queryFilter(
            flexirContract.filters.NewResaleOffer(
              null,
              orderId,
              null,
              null,
              null,
              signer.address
            ),
            fromBlockNumber,
            "latest"
          ),
          flexirContract.queryFilter(
            flexirContract.filters.CancelOffer(offerId),
            fromBlockNumber,
            "latest"
          ),
        ]);

        events = [...NewResaleOfferEvent, ...cancelOfferEvent];
        events.sort((a, b) => b.blockNumber - a.blockNumber);

        if (events.length > 0) {
          const log = flexirContract.interface.parseLog(events[0]);
          if (log) {
            setIsSelling(log.name === "NewResaleOffer");
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const fetchSettleFilled = async () => {
    if (signer && flexirContract && order) {
      try {
        const latestBlock = await provider!.getBlock("latest");
        const latestBlockNumber = latestBlock!.number;
        const fromBlockNumber = latestBlockNumber - 4500;

        const settleEvent = await flexirContract.queryFilter(
          flexirContract.filters.SettleFilled(
            orderId,
            null,
            null,
            signer.address
          ),
          fromBlockNumber,
          "latest"
        );

        if (settleEvent.length > 0) {
          setIsSettled(true);
          setSettleStatus("Settled");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const fetchTokenAmount = async () => {
    if (signer && flexirContract && order && token) {
      try {
        const decimals = await (
          tokenContract.connect(signer) as Contract
        ).decimals();

        const tokenAmount = ethers.formatUnits(
          order.amount * token.settleRate,
          decimals + 6n
        );

        setTokenAmount(String(tokenAmount));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const fetchSettleCancelled = async () => {
    if (signer && flexirContract && order && token) {
      try {
        const latestBlock = await provider!.getBlock("latest");
        const latestBlockNumber = latestBlock!.number;
        const fromBlockNumber = latestBlockNumber - 4500;

        const claimEvent = await flexirContract.queryFilter(
          flexirContract.filters.SettleCancelled(
            orderId,
            null,
            null,
            signer.address
          ),
          fromBlockNumber,
          "latest"
        );

        if (claimEvent.length > 0) {
          setIsClaimed(true);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (!order) return;
    fetchSelling();
    fetchSettleFilled();
    fetchSettleCancelled();
  }, [order]);

  return (
    <>
      <Box width={"1024px"} mx="auto">
        <Flex flexDir="column" mx="auto" mt="3%" pb={"50px"}>
          <Flex gap="4%" w="full" justifyContent="center" alignItems="center">
            {offer && token && (
              <OfferTradeWidget
                offer={offer}
                order={order}
                token={token}
                fetchBase={fetchBase}
                isClaimed={isClaimed}
                isSettled={isSettled}
                isSelling={isSelling}
                offerId={offerId}
                onOpen={onOpen}
                orderId={orderId}
                tokenAmount={tokenAmount}
              />
            )}
            {offer && token && (
              <OfferInfo
                offer={offer}
                offerId={offerId}
                order={order}
                token={token}
                tokenAmount={tokenAmount}
                settleStatus={settleStatus}
                setSettleStatus={setSettleStatus}
                collateral={collateral}
              />
            )}
          </Flex>
          {offer && (
            <OfferHistory
              offer={offer}
              offerId={offerId}
              tradeHistory={tradeHistory}
              setTradeHistory={setTradeHistory}
            />
          )}
        </Flex>
      </Box>
      {isOpen && (
        <ResaleModal
          isOpen={isOpen}
          onClose={onClose}
          orderData={order}
          pointMarketContract={flexirContract}
          signer={signer}
          orderId={orderId}
        />
      )}
    </>
  );
};

export default OfferDetails;
