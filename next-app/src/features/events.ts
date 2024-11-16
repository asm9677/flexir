import { Contract } from "ethers";

export const getOfferEvents = async (
  pointMarketContract: Contract,
  signerAddress?: string
): Promise<Offer[]> => {
  if (!pointMarketContract || !signerAddress) return [];

  try {
    // event NewOffer(uint256 id,OfferType offerType,bytes32 indexed tokenId,address exchangeToken,uint256 amount,uint256 value, uint256 collateral, bool fullMatch, address indexed doer);
    const newOfferEventFilter = pointMarketContract.filters.NewOffer(
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      signerAddress
    );

    // event NewResaleOffer(uint256 offerId,uint256 indexed originalOrderId,uint256 amount,uint256 value,uint8 reofferStatus,address indexed seller);
    const newResaleOfferEventFilter =
      pointMarketContract.filters.NewResaleOffer(
        null,
        null,
        null,
        null,
        null,
        signerAddress
      );

    const newOfferResults = pointMarketContract.queryFilter(
      newOfferEventFilter,
      0,
      "latest"
    );

    const newResaleOfferResults = pointMarketContract.queryFilter(
      newResaleOfferEventFilter,
      0,
      "latest"
    );

    return Promise.all([newOfferResults, newResaleOfferResults]).then((res) => {
      const newOfferEvents = res[0];
      const newResaleOfferEvents = res[1];

      const offers: Offer[] = [];

      newOfferEvents.map((v: any) => {
        if (v.args[1] == 1) {
          offers.push({
            offerId: v.args[0],
            offerStatus: 1,
            blockNumber: v.blockNumber,
            originalOrderId: BigInt(0),
          });
        } else if (v.args[1] == 2) {
          offers.push({
            offerId: v.args[0],
            offerStatus: 2,
            blockNumber: v.blockNumber,
            originalOrderId: BigInt(0),
          });
        }
      });

      newResaleOfferEvents.map((v: any) => {
        if (v.args[4] != 0) {
          offers.push({
            offerId: v.args[0],
            offerStatus: 2,
            blockNumber: v.blockNumber,
            originalOrderId: v.args[1],
          });
        }
      });

      const sortedOffers = offers.sort(
        (a, b) => Number(b.blockNumber) - Number(a.blockNumber)
      );
      return sortedOffers;
    });
  } catch (error) {
    console.error("Error fetching offer events:", error);
    return [];
  }
};

export const getOrderEvents = async (
  pointMarketContract: Contract,
  signerAddress?: string
): Promise<Order[]> => {
  if (!pointMarketContract || !signerAddress) return [];
  try {
    // event NewOrder(uint256 id, uint256 indexed offerId, uint256 amount, uint256 value, address indexed seller,address indexed buyer);
    const newOrderEventFilter = pointMarketContract.filters.NewOrder();

    // event ResaleOfferFilled(uint256 indexed resaleOfferId, uint256 amount, uint256 value, address buyer, address seller);
    const resaleOfferFilledFilter =
      pointMarketContract.filters.ResaleOfferFilled();

    const newOrderResults = pointMarketContract.queryFilter(
      newOrderEventFilter,
      0,
      "latest"
    );

    const resaleOfferFilledResults = pointMarketContract.queryFilter(
      resaleOfferFilledFilter,
      0,
      "latest"
    );

    return Promise.all([newOrderResults, resaleOfferFilledResults]).then(
      async (res) => {
        const newOrderEvents = res[0];
        const resaleOfferFilledEvents = res[1];

        const orders: Order[] = [];

        const newOrders = newOrderEvents.map((v: any) => {
          return {
            orderId: v.args[0],
            blockNumber: v.blockNumber,
            resaleOfferId: BigInt(0),
            amount: v.args[2],
            value: v.args[3],
          };
        });

        const resaleOrders = await Promise.all(
          resaleOfferFilledEvents.map(async (v: any) => {
            const offerData = await pointMarketContract.getOffer(
              Number(v.args[0])
            );

            return {
              orderId: offerData[10],
              blockNumber: v.blockNumber,
              resaleOfferId: v.args[0],
              amount: v.args[1],
              value: v.args[2],
            };
          })
        );

        const combinedOrders = [...newOrders, ...resaleOrders];
        const latestOrdersMap: { [key: number]: Order } = {};

        combinedOrders.forEach((order) => {
          const existingOrder = latestOrdersMap[Number(order.orderId)];
          if (!existingOrder || order.blockNumber > existingOrder.blockNumber) {
            latestOrdersMap[Number(order.orderId)] = order;
          }
        });

        const latestOrders = Object.values(latestOrdersMap);
        orders.push(...latestOrders);

        const sortedOrders = orders.sort(
          (a, b) => Number(b.blockNumber) - Number(a.blockNumber)
        );

        // Sort by blockNumber in descending order
        return sortedOrders;
      }
    );
  } catch (error) {
    console.error("Error fetching order events:", error);
    return [];
  }
};
