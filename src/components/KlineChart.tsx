import { useEffect, useRef } from 'react';
import { createChart, ColorType, UTCTimestamp } from 'lightweight-charts';
import styles from '@/styles/KlineChart.module.css';
import { KlineData } from '@/types/kline';

interface Props {
  data: KlineData;
}

export function KlineChart({ data }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 創建圖表
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.9)',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: UTCTimestamp) => {
          const date = new Date(time * 1000);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      crosshair: {
        vertLine: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1,
          style: 1,
          labelBackgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1,
          style: 1,
          labelBackgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
      },
    });

    // 添加K線系列
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: 'rgba(0, 255, 127, 0.9)',
      downColor: 'rgba(255, 99, 99, 0.9)',
      borderVisible: false,
      wickUpColor: 'rgba(0, 255, 127, 0.9)',
      wickDownColor: 'rgba(255, 99, 99, 0.9)',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    chartRef.current = { chart, candlestickSeries };

    // 響應式調整
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // 更新數據
  useEffect(() => {
    if (chartRef.current && data.candlesticks.length > 0) {
      // 確保數據是升序排列的
      const sortedData = [...data.candlesticks].sort((a, b) => a.time - b.time);
      // 移除重複的時間戳
      const uniqueData = sortedData.filter((item, index, self) =>
        index === self.findIndex(t => t.time === item.time)
      );
      chartRef.current.candlestickSeries.setData(uniqueData);

      // 設置可見範圍
      const timeScale = chartRef.current.chart.timeScale();
      timeScale.fitContent();
    }
  }, [data.candlesticks]);

  return (
    <div className={styles.chartContainer}>
      <h2>{data.pair}</h2>
      <div ref={chartContainerRef} className={styles.chart} />
    </div>
  );
} 