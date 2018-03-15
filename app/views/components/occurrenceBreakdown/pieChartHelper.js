module.exports = {
    getConfig: getConfig
};

function getConfig(data, element) {
    var serie = getSerie(data);
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
                showInLegend: true
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
        }
    };
}

function getSerie(data) {
    // Map data and keep empty slices. We could remove empty slices, but that would mean that the legend would change on updates
    var d = data.results.map(function(e) {
        return {
            name: e.displayName,
            y: e.count,
            visible: e.count > 0 // disable empty pie slices - this is to make it easier to read the legend.
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
