module.exports.trade = trade

function trade(candles) {

    latestCandle = candles[candles.length - 1]
    price = latestCandle.close

    const c = 9
    const b = 26
    const B = 52
    const lead = 26
    candlesLength = candles.length

    //conversionArray = candles.slice(candlesLength - c - lead, candlesLength - lead)
    //baseArray = candles.slice(candlesLength - b - lead, candlesLength - lead)
    //leadingbArray = candles.slice(candlesLength - B - lead, candlesLength - lead)

    conversion = (getHigh(conversionArray) + getLow(conversionArray)) / 2
    base = (getHigh(baseArray) + getLow(baseArray)) / 2

    leadingA = (conversion + base) / 2
    leadingB = (getHigh(leadingbArray) + getLow(leadingbArray)) / 2


    //return tradingEngine()

}

function tradingEngine() {

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
