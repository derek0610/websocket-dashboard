export interface OrderBookLevel {
  price: number;
  size: number;
}

export interface OrderBook {
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
  pair: string;
} 