module.exports = {
    getConfig: getConfig
};

function getConfig(data, element, clickCallback, translations) {
    translations = translations || {};
    var serie = getSerie(data, translations);
    return {
        chart: {
            animation: false,
            type: 'pie',
            renderTo: element
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                animation: false,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true,
                point: {
                    events: {
                        click: function() {
                            clickCallback(this.filter);
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
            visible: false
        },
        yAxis: {
            visible: false
        },
        series: [serie],
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
        }
    };
}

function getSerie(data, translations) {
    // Map data and keep empty slices. We could remove empty slices, but that would mean that the legend would change on updates
    var d = data.results.map(function(e) {
        return {
            name: e.displayName,
            filter: e.filter,
            y: e.count,
            visible: e.count > 0 // disable empty pie slices - this is to make it easier to read the legend.
        };
    });

    if (data.diff > 0) {
        d.push({
            name: translations.otherOrUknown || 'other or unknown',
            y: data.diff
        });
    }

    var serie = {
        name: translations.occurrences || 'Occurrences',
        data: d
    };
    return serie;
}
