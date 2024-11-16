interface Window {
  ethereum?: any; // 또는 더 구체적인 타입을 사용할 수 있습니다.
}

interface Offer {
  offerId: BigInt;
  offerStatus: Number;
  blockNumber: Number;
  originalOrderId: BigInt;
}

interface Order {
  orderId: BigInt;
  blockNumber: Number;
  resaleOfferId: BigInt;
  amount: BigInt;
  value: BigInt;
}

interface OrderData {
  orderId: Number;
  offerId: Number;
  amount: Number;
  value: Number;
  deposit: Number;
  seller: string;
  buyer: string;
}
