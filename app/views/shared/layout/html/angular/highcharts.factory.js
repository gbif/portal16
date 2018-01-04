'use strict';

var angular = require('angular');
var Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);

angular
    .module('portal')
    .factory('Highcharts', function ($filter, $translate) {

    // see https://api.highcharts.com/highcharts/lang

        Highcharts.setOptions({
            lang: {

                thousandsSep: $filter('localNumber')(1111, gb.locale).split('1')[1],
                decimalPoint: $filter('localNumber')(1.111, gb.locale).split('1')[1],
                months: [
                    $translate.instant('month.1'), $translate.instant('month.2'), $translate.instant('month.3'), $translate.instant('month.4'),
                        $translate.instant('month.5'), $translate.instant('month.6'), $translate.instant('month.7'), $translate.instant('month.8'),
                            $translate.instant('month.9'), $translate.instant('month.10'), $translate.instant('month.11'), $translate.instant('month.12')
                ],
                weekdays: [
                    $translate.instant('day.0'), $translate.instant('day.1'), $translate.instant('day.2'), $translate.instant('day.3'),
                    $translate.instant('day.4'), $translate.instant('day.5'), $translate.instant('day.6')
                ],
                contextButtonTitle : $translate.instant('Highcharts.contextButtonTitle'),
                downloadCSV : $translate.instant('Highcharts.downloadCSV'),
                downloadJPEG : $translate.instant('Highcharts.downloadJPEG'),
                downloadPDF : $translate.instant('Highcharts.downloadPDF'),
                downloadPNG: $translate.instant('Highcharts.downloadPNG'),
                downloadXLS: $translate.instant('Highcharts.downloadXLS')
            }
        });

        return Highcharts;
    });