var _ = require('lodash');

module.exports = {
    getConfig: getConfig
};

function getConfig(data, element, clickCallback, translations, logarithmic) {
    translations = translations || {};
    var series = getSeries(data, translations);

    return {
        chart: {
            animation: false,
            type: 'line',
            zoomType: 'x',
            renderTo: element
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.y}</b>'
        },
        plotOptions: {
            series: {
                connectNulls: false
            },
            line: {
                animation: false,
                marker: {
                    radius: 4
                },
                lineWidth: 3,
                states: {
                    hover: {
                        lineWidth: 3
                    }
                },
                threshold: null,
                point: {
                    events: {
                        click: function() {
                            // vm.occurrenceSearch(data.categoryKeys[this.index]);
                            var clickedFilter = _.assign({}, series[0].data[this.index][2]);
                            // if (data.categories) {
                            //     _.assign(clickedFilter, data.categories[this.series.columnIndex].filter);
                            // }
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
        subtitle: {
            text: document.ontouchstart === undefined ?
            translations.clickToZoom : translations.pinchToZoom
        },
        xAxis: {
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: translations.occurrences || 'Occurrences'
            },
            min: 0
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

function getSeries(data, translations) {
    var min, max, yearMap;
    if (!data.secondField) {
        min = _.toSafeInteger(_.get(_.minBy(data.results, function(e) {
            return _.toSafeInteger(e.displayName);
        }), 'displayName', 0));
        max = _.toSafeInteger(_.get(_.maxBy(data.results, function(e) {
            return _.toSafeInteger(e.displayName);
        }), 'displayName', 0));

        yearMap = {};
        _.range(min, max + 1).forEach(function(i) {
            yearMap[i] = [Date.UTC(i, 0, 1), 0, {year: i}];
        });
        data.results.forEach(function(e) {
            yearMap[_.toSafeInteger(e.filter.year)] = [Date.UTC(_.toSafeInteger(e.filter.year), 0, 1), e.count, e.filter];
        });
        var lineData = _.values(yearMap);
        // lineData = _.sortBy(lineData, ['[0]']); //sorting isn't technically guaranteed, but all browsers supposedly keep order by keys as they have been added
        return [{
            type: 'line',
            name: translations.occurrences || 'occurrences',
            data: lineData
        }];
    } else {
        console.error('Not implemented');
        return [];
        // // get min max
        // min = _.toSafeInteger(_.minBy(data.categories, function(e) {
        //     return _.toSafeInteger(e.displayName);
        // }).displayName);
        // max = _.toSafeInteger(_.maxBy(data.categories, function(e) {
        //     return _.toSafeInteger(e.displayName);
        // }).displayName);
        //
        // yearMap = {};
        // _.range(min, max + 1).forEach(function(i) {
        //     yearMap[i] = [Date.UTC(i, 0, 1), 0, {year: i}];
        // });
        //
        // return data.results.map(function(e) {
        //     return getSerie(e, data.categories);
        // });
    }
}
