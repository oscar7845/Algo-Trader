# Market-Trader
This app visualizes optimal trades in the BTC-USD market, making decisions based on real-time candlestick patterns and indicators. By integrating with Bitmex's API, the bot achieves an efficient trading experience. It operates autonomously and with the Bitmex API we achieve the automated trading visualization.

## The Idea
The BTC-USD market is wild, and I basically wanted to create a bot that does the hard work. It is a very unpredictable market so I created a bot that automates trading decisions based on real-time market data and technical indicators. The goal was to achieve consistent returns in the market of BTC trading against USD.

## How it works
This server fetches the latest 600 candlestick patterns, specific to the BTC-USD, pair from Bitmex and maintains a real-time feed using WebSockets. With the data, it executes various technical analysis techniques, such as the Ichimoku Cloud, MACD, and ATR. Based on the results from the indicators, the bot determines whether to BUY, SELL, or remain passive. You can visualize the current market and see the bot's decisions with an AngularJS frontend.

## How it was built
The main app is built on Node.js, fetching data using the BitMexApi and Bitmex realtime api. For data processing, the app relies on the async and requestretry modules. The frontend interface was created using AngularJS, with real-time socket interactions using socket.io.

Key Processes:
Start-up: The start() function initializes the process, obtaining BTC-USD candle data and initiating a WebSocket connection with Bitmex.
Data Collection: getBitmexCandles() retrieves BTC-USD candle data processing and storing it for analysis.
WebSocket Management: Both openBitmexSocket() and openClientSocket() manage WebSocket connections, with Bitmex and user clients.
Trade Analysis: The tradingEngine processes the BTC-USD candlestick data formulating a trading decision.
Real-time Updates: Utility functions manage real-time updates ensuring data synchronization with minimal lag.

## Bugs and challenges
The bot needed to update quickly without facing syncing problems or repeating tasks. Making sure the Bitmex API and WebSocket connections worked without issues was essential. The retryStrategy() was developed to manage failed requests effectively.

## Things learned
Got insights into the BTC-USD trading market, and managed live data streams and various new modules in Node.js I had not used before. Also learned to balance speed with accuracy.

## Roadmap
Looking ahead:
Advanced Analysis: Integrate more advanced analytical models, maybe some AI prediction.
Personalized Strategies: Allowing to select your individual trading parameters and risk preferences.
