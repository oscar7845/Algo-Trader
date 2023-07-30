module.exports.start = start
module.exports.openClientSocket = openClientSocket


const BitmexClient = require('bitmex-realtime-api')
var BitMexApi = require('bit_mex_api');
const async = require('async')
const rr = require('requestretry');

const tradingEngine = require('./tradingEngine')

appStatus = false
clientSocket = null
const serverTimeout = 500
const asyncMaxAttempts = 30
const asyncRetryDelay = 1000


retryParams = {
  fullResponse: false,
  maxAttempts: asyncMaxAttempts,
  retryDelay: asyncRetryDelay,
  retryStrategy: retryStrategy
}

gdaxSocket = null
gdaxResetInterval = null
gdaxErrorInterval = null

candleCount = 0
candleInterval = null
candleStartTime = 0

bitmexPrice = 0
tradeResult = ""
bitmexCandles = []


//trading variables
const candleMinute = 5
const maPeriod = 50
const candleDuration = 60000 * candleMinute
const leverage = 10

async function start() {
  await getBitmexCandles()
  openBitmexSocket()
}

async function getBitmexCandles() {

  var apiInstance = new BitMexApi.TradeApi();
  var opts = { 
    'binSize': "5m", // String 
    'partial': true, // Boolean 
    'symbol': "XBTUSD", // String
    'count': 750, // Number
    'start': 0, // Number
    'reverse': true, // Boolean
  };

  apiInstance.tradeGetBucketed(opts, function(error, data, respons) {
    if(data) {
         bitmexCandles = sortCandles(data)
     }
    })
    
  function sortCandles(data) {
    array = []
    data.reverse();
    for (var i = 0; i < data.length; i++) {

      let tick = data[i];
      var object = {};

      object.open = tick.open;
      object.high = tick.high;
      object.low = tick.low;
      object.close = tick.close;
      object.time = (new Date(tick.timestamp)).getTime();

      array.push(object)
    }

    console.log(array[array.length-1].close)

    return array
  }
}

function openBitmexSocket() {

  var deadInterval =  setInterval(detectDeadSocket, 30000) //kills dead socket after 30s
  var errorInterval = setInterval(errorCounter, 15000) //kills socket with errors
  var resetCount = 0 //prices streamed inside 30s (gdax reset interval)
  var errorCount = 0 //number of errors thrown by websocket 

  const bitmexClient = new BitmexClient({ testnet: false })
  bitmexClient.addStream('XBTUSD', 'instrument', function (data, symbol, tableName) {
    if (data.length) {
      const quote = data[data.length - 1];
      var time = (new Date(quote.timestamp)).getTime();

      if (appStatus == false) { 
        if (bitmexCandles[bitmexCandles.length - 1].time + candleDuration < time) { //finds missing candle
          console.log('Missing candle....restarting')
          sendClientMessage('Missing candle...restarting')
          clearInterval(deadInterval)
          clearInterval(errorInterval)
          bitmexCandles = []
          setTimeout(openBitmexSocket, 10000) 
        }
        else {
          appStatus = true
          bitmexAvailable = true
          console.log('App initiated')
          sendClientMessage('App initiated')
          startCandleTimer(time) //needed to sync
        }
      }

      bitmexAvailable = true
      resetCount++
      bitmexPrice = quote.lastPrice
      buildCandle(bitmexPrice)

      sendClientUpdate()
    }
  })
  bitmexClient.on('error', () => {
    errorCount++
    bitmexAvailable = false
  })
  bitmexClient.on('close', () => {

  })

  function detectDeadSocket() { //detect dead socket
    if (resetCount == 0) {
      console.log('Bitmex socket dead')
    }
    else {
      resetCount = 0
    }
  }

  function errorCounter() {
    if (errorCount > 2) {
      console.log('Socket error')
      
    }
    errorCount = 0
  }

}

function startCandleTimer(priceTime) {
  trade() //run trading engine on last candles.

  syncDelta = getSyncDelta(priceTime)

  i = bitmexCandles.length - 1 
  currentCandleEnd = bitmexCandles[i].time + (candleDuration - syncDelta)
  candleStartTime = bitmexCandles[i].time
  syncTime = currentCandleEnd - priceTime
  console.log(syncTime / 1000 + " seconds to sync")

  firstCandle = {
    open: bitmexCandles[i].close,
    high: bitmexPrice,
    low: bitmexPrice,
    close: bitmexPrice,
    time: bitmexCandles[i].time + candleDuration
  }
  bitmexCandles.push(firstCandle)
  setTimeout(closeCandle, syncTime) //close the candle
}

//closes candle on candleInterval
function closeCandle() {
  i = bitmexCandles.length - 1
  syncDelta = getSyncDelta(bitmexCandles[i].time)
  console.log("Delay:" + syncDelta + "ms")

  candleInterval = setTimeout(closeCandle, (candleDuration - syncDelta))
  candleCount++

  bitmexCandles[i].close = bitmexPrice

  console.log('---------------')
  trade()

  candleStartTime = (new Date()).getTime()
  newCandle = {
    open: bitmexPrice,
    high: bitmexPrice,
    low: bitmexPrice,
    close: bitmexPrice,
    time: bitmexCandles[i].time + candleDuration
  }
  bitmexCandles.shift() //remove last in candle array 
  bitmexCandles.push(newCandle)

}

function buildCandle(price) {
}

function trade() {
  candles = bitmexCandles

  function getTradeResult(candles) {
    return new Promise(resolve => {
      resolve(tradingEngine.trade(candles))
    })
  }

  async function delegateResult(candles) {
    result = await getTradeResult(candles)
    return result
  }

  delegateResult(candles)
    .then((result) => {
      if(result.action) {
        tradeResult = result
      }
      action = tradeResult.action
      console.log(action)
      sendClientData()
     
    });

}

function openClientSocket(ws) {
  if (ws) {

    if (clientSocket) {
      clientSocket.terminate()
      clientSocket = null
    }

    clientSocket = ws //transfer socket to global variable 
    object = createClientObject();
    ws.send(JSON.stringify(object)) //send client data
    sendClientUpdate() //send client latest price 
  }

}

function sendClientData() {
  if (clientSocket) {
    if (clientSocket.readyState === clientSocket.OPEN) {
      object = createClientObject()
      clientSocket.send(JSON.stringify(object))
    }
  }
}

function sendClientUpdate() { 
  if (clientSocket) {

    if (clientSocket.readyState === clientSocket.OPEN) {
      candleTimeLeft = 0
      if (candleStartTime != 0) {
        candleTimeLeft = getRemainingTime()
      }

      priceOject = { //sends price and status 
        bitmexRealtime: bitmexPrice,
        appStatus: appStatus,
        bitmexAvailable: bitmexAvailable,
        candleTimeLeft: candleTimeLeft      }
      clientSocket.send(JSON.stringify(priceOject))
    }

  }
}

function sendClientMessage(message) {
  if (clientSocket) {
    clientSocket.send(JSON.stringify({ appMessage: message }))
  }
}

function createClientObject() {
}

function getRemainingTime() {
}

//retry strategy for request library
function retryStrategy(err, response, body) {
  object = JSON.parse(body)
  isError = err || 500 <= response.statusCode && response.statusCode < 600 || object.error
  if (isError) {
    console.log('...')
    sendClientMessage('Error...retrying')
  }
  return isError
}

function getSyncDelta(time) {
}