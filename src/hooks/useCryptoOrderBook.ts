import { useState, useEffect } from 'react';
import { OrderBook } from '@/types/orderbook';

const CRYPTO_WS_URL = 'wss://stream.crypto.com/exchange/v1/market';

const TRADING_PAIRS = [
  'BTCUSD-PERP',  // 比特幣/美元永續合約
  'ETHUSD-PERP',  // 以太幣/美元永續合約
  'XRP_USDT',     // 瑞波幣/泰達幣
  'SOL_USDT',     // 索拉納/泰達幣
  'DOGE_USDT',    // 狗狗幣/泰達幣
  'ADA_USDT'      // 卡爾達諾/泰達幣
];

export function useCryptoOrderBook() {
  const [orderBooks, setOrderBooks] = useState<Record<string, OrderBook>>({});

  useEffect(() => {
    const ws = new WebSocket(CRYPTO_WS_URL);

    ws.onopen = () => {
      TRADING_PAIRS.forEach(pair => {
        const subscribeMsg = {
          id: Date.now(),
          method: "subscribe",
          params: {
            channels: [`book.${pair}.10`]
          }
        };
        console.log('Subscribing:', subscribeMsg);
        ws.send(JSON.stringify(subscribeMsg));
      });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
    //   console.log('Received message:', data);

      // 處理 heartbeat
      if (data.method === 'public/heartbeat') {
        // 回應 heartbeat
        ws.send(JSON.stringify({
          id: data.id,
          method: 'public/respond-heartbeat'
        }));
        return;
      }

      // 處理訂單簿數據
      if (data.result?.data) {
        const pair = data.result.instrument_name;
        
        setOrderBooks(prev => {
          const currentBook = prev[pair] || { pair, asks: [], bids: [] };
          const [orderBookData] = data.result?.data || [{ asks: [], bids: [] }];
          
          const processOrders = (orders: Array<[string, string]>) => 
            orders.map(([price, size]) => ({
              price: parseFloat(price),
              size: parseFloat(size)
            }));

          const newAsks = processOrders(orderBookData.asks);
          const newBids = processOrders(orderBookData.bids);

          // 賣單（asks）按價格從低到高排序，取前5個
          const sortedAsks = [...(currentBook.asks || []), ...newAsks]
            .sort((a, b) => a.price - b.price)
            .filter((ask, index, self) => 
              // 去重，保留相同價格中最新的數量
              index === self.findIndex(t => t.price === ask.price)
            )
            .slice(0, 5);

          // 買單（bids）按價格從高到低排序，取前5個
          const sortedBids = [...(currentBook.bids || []), ...newBids]
            .sort((a, b) => b.price - a.price)
            .filter((bid, index, self) => 
              index === self.findIndex(t => t.price === bid.price)
            )
            .slice(0, 5);

          return {
            ...prev,
            [pair]: {
              pair,
              asks: sortedAsks,
              bids: sortedBids
            }
          };
        });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  return orderBooks;
} 