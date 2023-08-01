module.exports.trade = trade

//trading logic

function trade(candles) {

    let latestCandle = candles[candles.length - 1];
    let price = latestCandle.close;

    const c = 9
    const b = 26
    const B = 52
    const lead = 26
    candlesLength = candles.length

    conversionArray = candles.slice(candlesLength - c - lead, candlesLength - lead)
    baseArray = candles.slice(candlesLength - b - lead, candlesLength - lead)
    leadingbArray = candles.slice(candlesLength - B - lead, candlesLength - lead)

    conversion = (getHigh(conversionArray) + getLow(conversionArray)) / 2
    base = (getHigh(baseArray) + getLow(baseArray)) / 2

    leadingA = (conversion + base) / 2
    leadingB = (getHigh(leadingbArray) + getLow(leadingbArray)) / 2

    macdHist = calculateMACDhist(candles)
    atr = calculateATR(candles, 14)

    return tradingEngine(leadingA, leadingB, macdHist, atr, price)

}

const RSI_PERIOD = 7;  // from 14 to 7
const BOLLINGER_PERIOD = 15;  // from 20 to 15
const BOLLINGER_MULTIPLIER = 1.5;  // from 2 to 1.5


function tradingEngine(leadingA, leadingB, macdHist, atr, price) {
    let action = 'Do nothing';

    const rsi = calculateRSI(candles, RSI_PERIOD);
    const { upperBand, lowerBand } = calculateBollingerBands(candles, BOLLINGER_PERIOD, BOLLINGER_MULTIPLIER);

    if (rsi < 30 && leadingA > leadingB && price > lowerBand && macdHist > 0) {
        action = "BUY";
    } else if (rsi > 70 || price < leadingB || price > upperBand || macdHist < 0) {
        action = "SELL";
    } else if (leadingA > leadingB) {
        action = "BUY";
    }

    return {
        action: action,
        leadingA: leadingA,
        leadingB: leadingB,
        macdHist: macdHist,
        atr: atr,
        rsi: rsi
    };
}

function calculateRSI(candles, period) {
    let avgGain = 0;
    let avgLoss = 0;

    for (let i = 1; i <= period; i++) {
        const change = candles[i].close - candles[i - 1].close;
        if (change >= 0) {
            avgGain += change;
        } else {
            avgLoss += Math.abs(change);
        }
    }

    avgGain /= period;
    avgLoss /= period;

    const rs = avgGain / avgLoss;

    return 100 - (100 / (1 + rs));
}

function calculateBollingerBands(candles, period, multiplier) {
    const sma = calculateMA(candles.slice(-period).map(candle => candle.close));
    let squaredDiffs = 0;

    for (let i = candles.length - period; i < candles.length; i++) {
        squaredDiffs += Math.pow(candles[i].close - sma, 2);
    }

    const standardDeviation = Math.sqrt(squaredDiffs / period);

    return {
        upperBand: sma + (multiplier * standardDeviation),
        lowerBand: sma - (multiplier * standardDeviation)
    };
}

//utils

function getHigh(array) {
    high = 0
    for (var i = 0; i < array.length; i++) {
        if (array[i].high > high) {
            high = array[i].high
        }
    }

    return high
}

function getLow(array) {
    low = 10000000000
    for (var i = 0; i < array.length; i++) {
        if (array[i].low < low) {
            low = array[i].low
        }
    }

    return low
}

function calculateMA(array) {
    sum = 0
    for (var i = 0; i < array.length; i++) {
        sum += array[i]
    }

    return sum / array.length
}

function calculateEMA(array, period) {
    ema = 0
    multiplier = 2 / (period + 1)
    tempArray2 = []

    for (var i = 0; i < array.length; i++) {
        if (i < period + 1) {
            tempArray2.push(array[i].close)

            if (tempArray.length == period) {
                ema = calculateMA(tempArray2)
                tempArray2 = []
            }
        }
        else {
            currentClose = array[i].close
            ema = ((currentClose - ema) * multiplier) + ema
        }
    }

    return ema
}

function calculateEMA2(array, period) {
    ema = 0
    multiplier = 2 / (period + 1)
    tempArray = []

    for (var i = 0; i < array.length; i++) {
        if (i < period + 1) {
            tempArray.push(array[i])

            if (tempArray.length == period) {
                ema = calculateMA(tempArray)
                tempArray = []
            }
        }
        else {
            currentClose = array[i]
            ema = ((currentClose - ema) * multiplier) + ema
        }
    }
    return ema
}

function calculateMACDhist(array) {
    macdHist = 0
    signalArray = []
    tempArray = []

    for (var i = 0; i < 100; i++) {
        tempArray = array.slice(100 + i, array.length - 100 + i)
        macdLineTemp = calculateEMA(tempArray, 12) - calculateEMA(tempArray, 26)
        signalArray.push(macdLineTemp)
        tempArray = []
    }

    macdLine = calculateEMA(array, 12) - calculateEMA(array, 26)
    signalArray.push(macdLine)
    signalLine = calculateEMA2(signalArray, 9)
    signalArray = []
    macdHist = macdLine - signalLine

    //console.log( macdHist + "  " + macdLine + "  " + signalLine)

    return Math.round(macdHist * 100) / 100
}

function calculateATR(array, period) {
    priorATR = 0
    currentTR = 0
    currentATR = 0
    tempArray3 = []
    tempArray4 = []

    for (var i = 0; i < array.length; i++) {
        if (i < period) {
            tempArray3.push(array[i])

            if (tempArray3.length == period) {
                candle1 = tempArray3[period - 1]
                currentTR = candle1.high - candle1.low
                for (var j = 0; j < period - 1; j++) {
                    tempCandle = tempArray3[j]
                    firstATR = tempCandle.high - tempCandle.low
                    tempArray4.push(firstATR)
                }
                priorATR = calculateMA(tempArray4)
                tempArray3 = []
                tempArray4 = []

                currentATR = (((priorATR * (period - 1)) + currentTR)) / period

            }
        }
        else {
            candle2 = array[i]
            currentTR = candle2.high - candle2.low
            currentATR = ((currentATR * (period - 1)) + currentTR) / period;
        }

    }

    return Math.round(currentATR * 100) / 100

}