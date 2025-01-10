import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useCryptoOrderBook } from "@/hooks/useCryptoOrderBook";
import { OrderBookCard } from "@/components/OrderBookCard";

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
  console.log('e',orderBooks)
  return (
    <>
      <Head>
        <title>Crypto.com Order Book</title>
        <meta name="description" content="Real-time crypto order book" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}>
        <main className={styles.main}>
          <h1>Crypto.com Order Book</h1>
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
