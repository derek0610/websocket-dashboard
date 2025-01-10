import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useCryptoOrderBook } from "@/hooks/useCryptoOrderBook";
import { useKlineData } from "@/hooks/useKlineData";
import { OrderBookCard } from "@/components/OrderBookCard";
import { KlineChart } from "@/components/KlineChart";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const orderBooks = useCryptoOrderBook();
  const klineData = useKlineData();
  console.log('klineData',klineData)
  return (
    <>
      <Head>
        <title>Crypto.com Trading View</title>
        <meta name="description" content="Real-time crypto trading view" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <h1>Crypto.com Trading View</h1>
          <KlineChart data={klineData} />
          <div className={styles.grid}>
            {Object.values(orderBooks).map((orderBook) => (
              <OrderBookCard key={orderBook.pair} orderBook={orderBook} />
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
