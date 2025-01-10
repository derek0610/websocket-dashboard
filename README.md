# Crypto.com Trading View

即時加密貨幣交易視圖應用程序，顯示K線圖和訂單簿深度資訊。

## 功能特點

- 即時K線圖顯示
  - 支援多個交易對
  - 1分鐘K線圖
  - 24小時歷史數據
  - 可通過點擊切換不同交易對

- 即時訂單簿
  - 顯示最佳5檔買賣盤
  - 實時更新價格和數量
  - 清晰的視覺區分買賣盤
  - 支援多個交易對同時顯示

- 支援的交易對
  - BTCUSD-PERP（比特幣永續合約）
  - ETHUSD-PERP（以太坊永續合約）
  - SOL_USDT（索拉納）
  - XRP_USDT（瑞波幣）
  - ADA_USDT（卡爾達諾）
  - DOGE_USDT（狗狗幣）

## 技術棧

- Next.js
- TypeScript
- WebSocket
- Lightweight Charts
- CSS Modules

## Getting Started

1. 安裝依賴：

```bash
npm install
```

2. 運行開發服務器：

```bash
npm run dev
```

3. 訪問 [http://localhost:3000](http://localhost:3000)

## 構建

```bash
npm run build
```

## 部署

```bash
npm run start
```


## 數據來源

- Crypto.com Exchange WebSocket API

