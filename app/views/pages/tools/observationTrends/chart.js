function showStats(data, minYear, maxYear) {
    minYear = minYear || 1900;
    maxYear = maxYear || 2016;

    let labels = [],
        points = [],
        line = [],
        groupLine = [],
        i;

    // parse the data attached to the vector tile
    let speciesCounts = typeof data.speciesCounts === 'string' ? JSON.parse(data.speciesCounts) : data.speciesCounts;
    let groupCounts = typeof data.groupCounts === 'string' ? JSON.parse(data.groupCounts) : data.groupCounts;

    // transform data to the format the Chartist library expects
    for (i = minYear; i < maxYear; i++) {
        labels.push(i);
        if (groupCounts.hasOwnProperty(i.toString())) {
            // Calculate the relative amount of the species in relation to the group
            let s = speciesCounts[i] || 0;
            let g = groupCounts[i];
            let val = s / g;
            points.push(val);

            // group counts for drawing the area graph so that the user can easily see how much data was available that year
            groupLine.push(g);
        } else {
            points.push(null);
            groupLine.push(null);
        }
        // draw the regression line
        line.push(data.slope * i + data.intercept);
    }

    let interval = (maxYear - minYear) > 100 ? 25 : 10;

    new Chartist.Line('.regression-chart', {
        labels: labels,
        series: [
            {
                name: 'points',
                data: points,
            },
            {
                name: 'line',
                data: line,
            },
        ],
    }, {
        fullWidth: true,
        axisX: {
            labelInterpolationFnc: function(value, index) {
                return index % interval === 0 ? value : '';
            },
            showGrid: false,
        },
        axisY: {
            labelInterpolationFnc: function(value) {
                return +value.toFixed(5);
            },
        },
        low: 0,
        series: {
            'line': {
                lineSmooth: Chartist.Interpolation.none({
                    fillHoles: true,
                }),
                showLine: true,
                showArea: false,
                showPoint: false,
            },
            'points': {
                showLine: false,
                showArea: false,
                showPoint: true,
            },
        },
    });

    new Chartist.Line('.count-chart', {
        labels: labels,
        series: [
            {
                name: 'groupLine',
                data: groupLine,
            },
        ],
    }, {
        fullWidth: true,
        axisX: {
            labelInterpolationFnc: function(value, index) {
                return index % interval === 0 ? value : '';
            },
            showGrid: false,
        },
        low: 0,
        series: {
            'groupLine': {
                showArea: true,
                showLine: false,
                showPoint: false,
            },
        },
    });
}

module.exports = {
    showStats: showStats,
};
