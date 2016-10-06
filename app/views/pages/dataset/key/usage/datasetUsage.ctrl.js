'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('datasetUsageCtrl', datasetUsageCtrl);

/** @ngInject */
function datasetUsageCtrl(OccurrenceSearch) {
    var vm = this;
    vm.bibExpand = {
        isExpanded: false
    };

    vm.key = gb.datasetKey.key; //TODO what would be a better way to do this? an bootstraped constant possibly?

    vm.latLon = {lat: 45, lon: 10};

    vm.data = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        series: [
            [5, 4, 3, 7, 5, 10, 3],
            [3, 2, 9, 5, 4, 6, 4]
        ]
    };


    vm.options = {
        seriesBarDistance: 10,
        reverseData: true,
        horizontalBars: true,
        axisY: {
            offset: 70
        }
        //axisX: {
        //    labelInterpolationFnc: function (value, index) {
        //        return formatIntegerNumber(value, 1);
        //    }
        //}
        //axisX: {
        //    labelInterpolationFnc: function(value, index) {
        //        return index % 2 === 0 ? value : null;
        //    }
        //}
    };



    var monthQuery = {
        dataset_key: vm.key,
        facet: 'month',
        'month.facetLimit': 12,
        limit: 0
    };

    function formatIntegerNumber(bytes, decimals) {
        if (bytes == 0) return '0';
        var k = 1000;
        var dm = decimals + 1 || 3;
        var sizes = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + '' + sizes[i];
    }

    //OccurrenceSearch.query(monthQuery, function(response){
    //    console.log('months');
    //    var monthCounts = _.get(response, 'facets[0].counts');
    //    if (monthCounts) {
    //        var serie = _.sortBy(monthCounts, function(a){
    //            return parseInt(a.name);
    //        }).map(function (e) {
    //            return e.count;
    //        });
    //        vm.options.low = _.min(serie);
    //        vm.options.high = _.max(serie);
    //        vm.data.series[0] = serie;
    //    }
    //
    //}, function(err){
    //    console.log(err);
    //});

    //var yearQuery = {
    //    dataset_key: vm.key,
    //    facet: 'year',
    //    'year.facetLimit': 1000,
    //    limit: 0
    //};
    //
    //OccurrenceSearch.query(yearQuery, function(response){
    //    var yearCounts = _.get(response, 'facets[0].counts');
    //    if (yearCounts) {
    //        var sorted = _.sortBy(yearCounts, function(a){
    //            return parseInt(a.name);
    //        });
    //        var serie = sorted.map(function (e) {
    //            return e.count;
    //        });
    //        var labels = sorted.map(function (e) {
    //            return e.name;
    //        });
    //        vm.options.low = _.min(serie);
    //        vm.options.high = _.max(serie);
    //        vm.data.series[0] = serie;
    //        vm.data.labels = labels;
    //    }
    //
    //}, function(err){
    //    console.log(err);
    //});
}

module.exports = datasetUsageCtrl;