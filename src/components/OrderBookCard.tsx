import styles from '@/styles/OrderBookCard.module.css';
import { OrderBook } from '@/types/orderbook';

interface Props {
  orderBook: OrderBook;
}

// 輔助函數：格式化數字，保留所有小數位
function formatNumber(num: number): string {
  // 轉換為字符串並移除末尾的0
  return num.toString().replace(/\.?0+$/, '');
}

export function OrderBookCard({ orderBook }: Props) {
  return (
    <div className={styles.card}>
      <h3>{orderBook.pair}</h3>
      <div className={styles.orderBook}>
        <div className={styles.levels}>
          {orderBook.asks.map((ask, i) => (
            <div key={`ask-${i}`} className={styles.row}>
              <div className={styles.bidSide}>
                <span>{orderBook.bids[i] ? formatNumber(orderBook.bids[i].size) : ''}</span>
                <span className={styles.bidPrice}>
                  {orderBook.bids[i] ? formatNumber(orderBook.bids[i].price) : ''}
                </span>
              </div>
              <div className={styles.askSide}>
                <span className={styles.askPrice}>{formatNumber(ask.price)}</span>
                <span>{formatNumber(ask.size)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 