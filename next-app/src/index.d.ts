interface IOffer {
  offerType: bigint;
  tokenId: string;
  exchangeToken: string;
  amount: bigint;
  value: bigint;
  collateral: bigint;
  filledAmount: bigint;
  status: number;
  offeredBy: string;
  fullMatch: boolean;
  originalOrderId: bigint;
  reofferStatus: number;
}

interface IOrder {
  offerId: number;
  amount: number;
  value: number;
  seller: string;
  buyer: string;
  status: number;
}

interface ITradeHistory {
  timestamp: string;
  txHash: string;
  offerId: string;
  seller: string;
  buyer: string;
}

interface IToken {
  tokenAddr: string;
  settleTime: number;
  settleDuration: number;
  settleRate: number;
  status: number;
}
