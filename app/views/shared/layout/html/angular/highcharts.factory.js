'use strict';

var angular = require('angular');
var Highcharts = require('highcharts');
window.Highcharts = Highcharts;
require('highcharts/modules/exporting')(Highcharts);
require('highcharts/modules/boost')(Highcharts);
require('highcharts/modules/sunburst')(Highcharts);

angular
    .module('portal')
    .factory('Highcharts', function($filter, $translate, LOCALE_2_LETTER, $q) {
        // see https://api.highcharts.com/highcharts/lang
        var translations = {
            'month.1': $translate('month.1'),
            'month.2': $translate('month.2'),
            'month.3': $translate('month.3'),
            'month.4': $translate('month.4'),
            'month.5': $translate('month.5'),
            'month.6': $translate('month.6'),
            'month.7': $translate('month.7'),
            'month.8': $translate('month.8'),
            'month.9': $translate('month.9'),
            'month.10': $translate('month.10'),
            'month.11': $translate('month.11'),
            'month.12': $translate('month.12'),
            'day.0': $translate('day.0'),
            'day.1': $translate('day.1'),
            'day.2': $translate('day.2'),
            'day.3': $translate('day.3'),
            'day.4': $translate('day.4'),
            'day.5': $translate('day.5'),
            'day.6': $translate('day.6')
        };
        $q.all(translations).then(function(res) {
            Highcharts.theme.lang = {
                thousandsSep: $filter('localNumber')(1111, LOCALE_2_LETTER).split('1')[1],
                decimalPoint: $filter('localNumber')(1.111, LOCALE_2_LETTER).split('1')[1],
                months: [
                    res['month.1'], res['month.2'], res['month.3'], res['month.4'], res['month.5'], res['month.6'], res['month.7'], res['month.8'], res['month.9'], res['month.10'], res['month.11'], res['month.12']
                ],
                weekdays: [
                    res['day.0'], res['day.1'], res['day.2'], res['day.3'], res['day.4'], res['day.5'], res['day.6']
                ]
            };
            Highcharts.setOptions(Highcharts.theme);
        });
        return Highcharts;
    });

Highcharts.theme = {
    colors: [
        '#71b171',
        '#505160',
        '#e6d72a',
        '#68829E',
        '#98dbc6',
        '#f18d9e',
        '#aebd38',
        '#324851',
        '#5bc8ac',
        '#86ac41',
        '#7da3a1'
    ],
    chart: {
        // backgroundColor: {
        //    linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
        //    stops: [
        //        [0, '#2a2a2b'],
        //        [1, '#3e3e40']
        //    ]
        // },
        style: {
            fontFamily: 'Roboto, sans-serif'
        },
        plotBorderColor: '#606063'
    },
    title: {
        style: {
            color: '#666',
            fill: '#666',
            textTransform: 'uppercase',
            fontSize: '12px'
        }
    },
    subtitle: {
        style: {
            color: '#666',
            fontSize: '12px'
        }
    },
    // xAxis: {
    //    gridLineColor: '#707073',
    //    labels: {
    //        style: {
    //            color: '#E0E0E3'
    //        }
    //    },
    //    lineColor: '#707073',
    //    minorGridLineColor: '#505053',
    //    tickColor: '#707073',
    //    title: {
    //        style: {
    //            color: '#A0A0A3'
    //
    //        }
    //    }
    // },
    // yAxis: {
    //    gridLineColor: '#707073',
    //    labels: {
    //        style: {
    //            color: '#E0E0E3'
    //        }
    //    },
    //    lineColor: '#707073',
    //    minorGridLineColor: '#505053',
    //    tickColor: '#707073',
    //    tickWidth: 1,
    //    title: {
    //        style: {
    //            color: '#A0A0A3'
    //        }
    //    }
    // },
    tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        style: {
            color: '#F0F0F0'
        }
    },
    plotOptions: {
        series: {
            dataLabels: {
                color: '#666'
            },
            marker: {
                lineColor: '#333'
            }
        },
        boxplot: {
            fillColor: '#505053'
        },
        candlestick: {
            lineColor: 'white'
        },
        errorbar: {
            color: 'white'
        }
    },
    legend: {
        itemStyle: {
            color: '#606063',
            fontWeight: 'normal'
        },
        itemHoverStyle: {
            color: '#8d8f92'
        },
        itemHiddenStyle: {
            color: '#bec5d0'
        }
    },
    credits: {
        style: {
            color: '#666'
        }
    },
    labels: {
        style: {
            color: '#707073'
        }
    },

    drilldown: {
        activeAxisLabelStyle: {
            color: '#F0F0F3'
        },
        activeDataLabelStyle: {
            color: '#F0F0F3'
        }
    },

    navigation: {
        buttonOptions: {
            symbolStroke: '#666',
            theme: {
                // fill: '#f00'
                // fill: '#505053'
            }
        }
    },

    // scroll charts
    rangeSelector: {
        buttonTheme: {
            fill: '#505053',
            stroke: '#000000',
            style: {
                color: '#CCC'
            },
            states: {
                hover: {
                    fill: '#707073',
                    stroke: '#000000',
                    style: {
                        color: 'white'
                    }
                },
                select: {
                    fill: '#000003',
                    stroke: '#000000',
                    style: {
                        color: 'white'
                    }
                }
            }
        },
        inputBoxBorderColor: '#505053',
        inputStyle: {
            backgroundColor: '#333',
            color: 'silver'
        },
        labelStyle: {
            color: 'silver'
        }
    },

    navigator: {
        handles: {
            backgroundColor: '#666',
            borderColor: '#AAA'
        },
        outlineColor: '#CCC',
        maskFill: 'rgba(255,255,255,0.1)',
        series: {
            color: '#7798BF',
            lineColor: '#A6C7ED'
        },
        xAxis: {
            gridLineColor: '#505053'
        }
    },

    scrollbar: {
        barBackgroundColor: '#808083',
        barBorderColor: '#808083',
        buttonArrowColor: '#CCC',
        buttonBackgroundColor: '#606063',
        buttonBorderColor: '#606063',
        rifleColor: '#FFF',
        trackBackgroundColor: '#404043',
        trackBorderColor: '#404043'
    },

    // special colors for some of the
    legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
    background2: '#505053',
    dataLabelsColor: '#666',
    textColor: '#C0C0C0',
    contrastTextColor: '#F0F0F3',
    maskColor: 'rgba(255,255,255,0.3)'
};

// resize charts before printing
window.onbeforeprint = function() {
    Highcharts.charts.forEach(function(chart, i) {
        if (typeof chart !== 'undefined') {
            console.log('iterate');
            chart.setSize(650, undefined, false);
        }
    });
};

window.onafterprint = function() {
    location.reload();
};
