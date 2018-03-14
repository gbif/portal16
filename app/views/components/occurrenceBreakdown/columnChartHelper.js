var _ = require('lodash');

module.exports = {
    getConfig: getConfig,
    setChartElementSize: setChartElementSize
};

function getConfig(data, element, clickCallback) {
    var series = getSeries(data);

    // estimate what type to use. Col is easier to read for small amounts of data, but won't fit on screen for large amounts
    var type = 'column';
    var groupPadding = (data.results.length * 1.3 * _.get(data, 'categories.length', 1) > 40) ? 0.04 : 0.08;
    // if (data.results.length * 1.3 * _.get(data, 'categories.length', 1) > 60) {
    //     type = 'bar';
    // }

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
            crosshair: true
        },
        yAxis: {
            // min: 0,
            type: 'logarithmic',
            minorTickInterval: 1,
            title: {
                text: 'Occurrences'
            }
        },
        series: series,
        exporting: {
            buttons: {
                contextButton: {
                    enabled: false
                }
            }
        }
    };
}
function getSeries(data) {
    if (!data.secondField) {
        return [getSerie(data)];
    } else {
        var series = data.categories.map(function(e) {
            return {
                name: e.displayName,
                data: []
            };
        });
        data.results.map(function(e) {
            e.values.forEach(function(v, i) {
                series[i].data.push(v);
            });
        });
        return series;
    }
}

function getSerie(data) {
    var d = data.results.map(function(e) {
        return {
            name: e.displayName,
            y: e.count
        };
    });

    if (data.diff > 0) {
        d.push({
            name: 'other or unknown',
            y: data.diff
        });
    }

    var serie = {
        name: 'Occurrences',
        data: d
    };
    return serie;
}

function setChartElementSize(element, config) {
    if (config.chart.type == 'column') {
        element.style.width = (config.xAxis.categories.length * config.series.length * 5 + 100) + 'px';
    }
}
