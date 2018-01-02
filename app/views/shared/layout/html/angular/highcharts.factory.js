'use strict';

var angular = require('angular');
var Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);

angular
    .module('portal')
    .factory('Highcharts', function () {
        return Highcharts;
    });