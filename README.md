# Market-Trader
This app visualizes optimal trades in the BTC-USD market, making decisions based on real-time candlestick patterns and indicators. By integrating with Bitmex's API, the bot achieves an efficient trading experience. It operates autonomously and with the Bitmex API we achieve the automated trading visualization.

## The Idea
The BTC-USD market is wild, and I basically wanted to create a bot that does the hard work. The goal was to achieve consistent returns in the market of BTC trading against USD.

## How it works
This server fetches the latest 600 candlestick patterns, specific to the BTC-USD, pair from Bitmex and maintains a real-time feed using WebSockets. With the data, it executes various technical analysis techniques, such as the Ichimoku Cloud, MACD, and ATR. Based on the results from the indicators, the bot determines whether to BUY, SELL, or remain passive. You can visualize the current market and see the bot's decisions with an AngularJS frontend.

## How it was built
The main app is built on Node.js, fetching data using the BitMexApi and Bitmex realtime api. 

Key Processes:
Data Collection
WebSocket 

## Bugs and challenges

## Things learned

## Roadmap
