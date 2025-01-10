import { useState, useEffect } from 'react';
import { KlineData, Candlestick } from '@/types/kline';

const CRYPTO_WS_URL = 'wss://stream.crypto.com/exchange/v1/market';
const TRADING_PAIR = 'BTCUSD-PERP';

// 計算過去24小時的開始時間（以毫秒為單位）
const getStartTime = () => {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return twentyFourHoursAgo.getTime();
};

export function useKlineData() {
  const [klineData, setKlineData] = useState<KlineData>({
    pair: TRADING_PAIR,
    candlesticks: []
  });

  useEffect(() => {
    const ws = new WebSocket(CRYPTO_WS_URL);

    ws.onopen = () => {
      // 訂閱即時K線數據
      const subscribeMsg = {
        id: Date.now(),
        method: "subscribe",
        params: {
          channels: [`candlestick.1m.${TRADING_PAIR}`]
        }
      };

      // 請求歷史K線數據
      const historyMsg = {
        id: Date.now() + 1,
        method: "public/get-candlestick",
        params: {
          instrument_name: TRADING_PAIR,
          timeframe: "1m",
          start_ts: getStartTime(),
          count: 1440  // 24小時 * 60分鐘
        }
      };

      console.log('Subscribing to kline:', subscribeMsg);
      console.log('Requesting history:', historyMsg);
      
      ws.send(JSON.stringify(historyMsg));  // 先請求歷史數據
      ws.send(JSON.stringify(subscribeMsg)); // 再訂閱即時數據
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // 處理 heartbeat
      if (data.method === 'public/heartbeat') {
        ws.send(JSON.stringify({
          id: data.id,
          method: 'public/respond-heartbeat'
        }));
        return;
      }

      // 處理K線數據（包括歷史數據和即時數據）
      if (data.result?.data) {
        setKlineData(prev => {
          const newCandlesticks = [...prev.candlesticks];
          
          // 處理所有收到的K線數據
          data.result.data.forEach((candlestick: any) => {
            const newCandlestick = {
              time: Math.floor(candlestick.t / 1000),
              open: parseFloat(candlestick.o),
              high: parseFloat(candlestick.h),
              low: parseFloat(candlestick.l),
              close: parseFloat(candlestick.c),
              volume: parseFloat(candlestick.v)
            };

            // 檢查是否已存在相同時間戳的K線
            const existingIndex = newCandlesticks.findIndex(
              c => c.time === newCandlestick.time
            );

            if (existingIndex >= 0) {
              newCandlesticks[existingIndex] = newCandlestick;
            } else {
              newCandlesticks.push(newCandlestick);
            }
          });

          // 按時間排序並限制數量
          return {
            ...prev,
            candlesticks: newCandlesticks
              .sort((a, b) => a.time - b.time)
              .slice(-1440) // 保留24小時的數據
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

  return klineData;
} 