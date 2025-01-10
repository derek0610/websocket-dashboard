import { Time } from 'lightweight-charts';

export interface Candlestick {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface KlineData {
  pair: string;
  candlesticks: Candlestick[];
} 