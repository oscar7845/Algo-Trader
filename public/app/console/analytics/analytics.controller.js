(function () {
    'use strict';

    angular
        .module('app.console')
        .controller('AnalyticsController', AnalyticsController);


    AnalyticsController.$inject = ['socketService', '$scope'];

    function AnalyticsController(socketService, $scope) {

        var vm = this;
        vm.password = ""
        vm.sendAppAction = sendAppAction
        vm.startMessage = ""
        vm.round = round

        vm.price = {}
        vm.data = {}
 
        vm.chartData = [[],[], [], [], []]
        vm.series = [["close"],["low"], ["high"], ["leadingA"], ["leadingB"]]
        vm.labels = []
        vm.chartOptions = [
            {pointRadius: 3, borderColor:'#97BBCD'},
            {pointRadius: 3, fill:false, borderColor:'#4CAF50', pointBackgroundColor:'#4CAF50'},
            {pointRadius: 3, fill:false},
            {fill:false},
            {fill:false}
        ]

        socketService.onmessage(function(event) {
            var object = JSON.parse(event.data);

            if (object.bitmexRealtime || object.bitmexRealtime == 0) {
                $scope.$apply(function(){
                    vm.price = object
                    vm.chartData[0][vm.chartData[0].length -1] = object.bitmexRealtime
                    //vm.chartData[0][] = object.gdaxRealtime

                    //console.log(vm.price)
                });
            }
            else if(object.appMessage) {
                $scope.$apply(function(){
                    vm.startMessage = object.appMessage
                }); 
            }
            else {
                $scope.$apply(function(){
                    vm.data = object
                    //console.log(vm.data)
                    parseChartData(object)
                });
            }
        });


    function sendAppAction(action) {
        vm.startMessage = ""
        socketService.send(vm.password + action)
    }

    function parseChartData(object) {
        var candles = object.candles
        var count = object.candleCount

        vm.chartData[0] = []
        vm.chartData[1] = []
        vm.chartData[2] = []
        vm.chartData[3] = []
        vm.chartData[4] = []
        vm.labels = []

        for (var i = 0; i < candles.length; i++) {
            vm.chartData[0].push(candles[i].close)
            vm.chartData[1].push(candles[i].low)
            vm.chartData[2].push(candles[i].high)
            vm.chartData[3].push(vm.data.trade.leadingA)
            vm.chartData[4].push(vm.data.trade.leadingB)
            vm.labels.push('')
        }

        if (count != 0 ) {
            vm.chartData[0].push(candles[candles.length-1].close)
            vm.chartData[1].push(candles[candles.length-1].low)
            vm.chartData[2].push(candles[candles.length-1].high)
            vm.chartData[3].push(vm.data.trade.leadingA)
            vm.chartData[4].push(vm.data.trade.leadingB)
            vm.labels.push('')
        }


    }

    function round(number) {
        var rounded = Math.round(number)
        return rounded
    }
        
    }
})();