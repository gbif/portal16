var _ = require('lodash');
var filters = require('../../shared/layout/html/angular/filters');

module.exports = {
    getConfig: getConfig,
    setChartElementSize: setChartElementSize
};

function getConfig(data, element, clickCallback, translations, logarithmic) {
    translations = translations || {};
    var series = getSeries(data, translations);

    var type = 'column';
    var totalCounts = data.results.length * _.get(data, 'categories.length', 1);
    var isLogaritmic = totalCounts > 1 ? logarithmic : false;

    var groupPadding = 0;
    var pointPadding = 0;
    if (_.get(data, 'categories.length', 0) > 0) {
        groupPadding = (data.results.length * 1.3 * _.get(data, 'categories.length', 1) > 40) ? 0.04 : 0.08;
        pointPadding = null;
    }

    return {
        chart: {
            animation: false,
            type: type,
            renderTo: element
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b>'
        },
        plotOptions: {
            column: {
                groupPadding: groupPadding,
                pointPadding: pointPadding,
                animation: false,
                point: {
                    events: {
                        click: function() {
                            var clickedFilter = _.assign({}, data.results[this.index].filter);
                            if (data.categories) {
                                _.assign(clickedFilter, data.categories[this.series.columnIndex].filter);
                            }
                            clickCallback(clickedFilter);
                        }
                    }
                }
            }
        },
        credits: {
            enabled: false
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: data.results.map(function(e) {
                return e.displayName;
            }),
            crosshair: !!data.categories && data.results.length > 1,
            labels: {
                formatter: function() {
                    return filters.truncate(this.value, 50);
                }
            }
        },
        yAxis: {
            // min: 0,
            type: isLogaritmic ? 'logarithmic' : 'linear',
            minorTickInterval: isLogaritmic ? 1 : undefined,
            title: {
                text: translations.occurrences || 'occurrences'
            }
        },
        series: series,
        exporting: {
            buttons: {
                contextButton: {
                    enabled: false
                }
            }
        },
        legend: {
            itemStyle: {
                width: '200px',
                textOverflow: 'ellipsis',
                overflow: 'hidden'
            }
        },
        _setChartElementSize: setChartElementSize
    };
}

function getSeries(data, translations) {
    if (!data.secondField) {
        return [getSerie(data, translations)];
    } else {
        var series = data.categories.map(function(e) {
            return {
                name: e.displayName,
                data: [],
                visible: false
            };
        });
        data.results.map(function(e) {
            e.values.forEach(function(v, i) {
                series[i].data.push(v);
                series[i].visible = series[i].visible || v > 0;
            });
        });
        return series;
    }
}

function getSerie(data, translations) {
    var d = data.results.map(function(e) {
        return {
            name: e.displayName,
            y: e.count
        };
    });

    // if (data.diff > 0) {
    //     d.push({
    //         name: 'other or unknown',
    //         y: data.diff
    //     });
    // }

    var serie = {
        name: translations.occurrences || 'Occurrences',
        data: d
    };
    return serie;
}

function setChartElementSize(element, config) {
    if (config.chart.type == 'column') {
        element.style.width = (config.xAxis.categories.length * config.series.length * 5 + 100) + 'px';
    }
}
