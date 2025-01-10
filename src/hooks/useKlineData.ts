import { useState, useEffect } from 'react';
import { KlineData } from '@/types/kline';

const CRYPTO_WS_URL = 'wss://stream.crypto.com/exchange/v1/market';

export const TRADING_PAIRS = [
  'BTCUSD-PERP',
  'ETHUSD-PERP',
  'SOL_USDT',
  'XRP_USDT',
  'ADA_USDT',
  'DOGE_USDT'
];

const getStartTime = () => {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return twentyFourHoursAgo.getTime();
};

export function useKlineData() {
  const [klineDataMap, setKlineDataMap] = useState<Record<string, KlineData>>(
    Object.fromEntries(TRADING_PAIRS.map(pair => [pair, { pair, candlesticks: [] }]))
  );

  useEffect(() => {
    const ws = new WebSocket(CRYPTO_WS_URL);

    ws.onopen = () => {
      // 訂閱所有交易對的即時K線數據
      TRADING_PAIRS.forEach(pair => {
        const subscribeMsg = {
          id: Date.now() + TRADING_PAIRS.indexOf(pair),
          method: "subscribe",
          params: {
            channels: [`candlestick.1m.${pair}`]
          }
        };

        const historyMsg = {
          id: Date.now() + TRADING_PAIRS.length + TRADING_PAIRS.indexOf(pair),
          method: "public/get-candlestick",
          params: {
            instrument_name: pair,
            timeframe: "1m",
            start_ts: getStartTime(),
            count: 1440
          }
        };

        ws.send(JSON.stringify(historyMsg));
        ws.send(JSON.stringify(subscribeMsg));
      });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.method === 'public/heartbeat') {
        ws.send(JSON.stringify({
          id: data.id,
          method: 'public/respond-heartbeat'
        }));
        return;
      }

      if (data.result?.data) {
        const pair = data.result.instrument_name;
        if (!pair || !TRADING_PAIRS.includes(pair)) return;

        setKlineDataMap(prev => {
          const newCandlesticks = [...(prev[pair]?.candlesticks || [])];
          
          data.result.data.forEach((candlestick: any) => {
            const newCandlestick = {
              time: Math.floor(candlestick.t / 1000),
              open: parseFloat(candlestick.o),
              high: parseFloat(candlestick.h),
              low: parseFloat(candlestick.l),
              close: parseFloat(candlestick.c),
              volume: parseFloat(candlestick.v)
            };

            const existingIndex = newCandlesticks.findIndex(
              c => c.time === newCandlestick.time
            );

            if (existingIndex >= 0) {
              newCandlesticks[existingIndex] = newCandlestick;
            } else {
              newCandlesticks.push(newCandlestick);
            }
          });

          return {
            ...prev,
            [pair]: {
              pair,
              candlesticks: newCandlesticks
                .sort((a, b) => a.time - b.time)
                .slice(-1440)
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

  return klineDataMap;
} 