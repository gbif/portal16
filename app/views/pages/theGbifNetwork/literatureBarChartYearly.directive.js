'use strict';

var angular = require('angular'),
    d3 = require('d3');

angular
    .module('portal')
    .directive('literatureBarChartYearly', literatureBarChartYearly);

/** @ngInject */
function literatureBarChartYearly(LiteratureYearly, $translate) {
    return {
        restrict: 'A',
        replace: 'false',
        scope: {
            region: '='
        },
        link: drawChart
    };

    function drawChart(scope, element, attrs) {
        var margin = {top: 50, right: 20, bottom: 80, left: 40},
            width = 600 - margin.left - margin.right,
            height = 280 - margin.top - margin.bottom,
            svgWidth = width + margin.left + margin.right,
            svgHeight = height + margin.top + margin.bottom;

        // set the ranges
        var x = d3.scaleBand().rangeRound([0, width], .05);

        var y = d3.scaleLinear().range([height, 0]);

        // define the axis
        var xAxis = d3.axisBottom()
            .scale(x);

        // var yAxis = d3.axisLeft().scale(y).ticks(10);

        // add the SVG element
        var svg = d3.select(element[0]).append("svg")
            //.attr("width", svgWidth)
            //.attr("height", svgHeight)
            .attr('viewBox', '0 0 ' + svgWidth + ' ' + svgHeight)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .classed('svg-content', true)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")
            ;

        LiteratureYearly.get({'gbifRegion': scope.region}).$promise
            .then(function(response){

                var data = response;

                data.forEach(function(d) {
                    d.year = d.year;
                    d.literature_number = + d.literature_number;
                });

                // scale the range of the data
                x.domain(data.map(function(d) { return d.year; }));
                y.domain([0, d3.max(data, function(d) { return d.literature_number; })]);

                // add axis
                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("class", "axis-text")
                    .attr("dx", "1.1em")
                    .attr("dy", "1.4em");
                    //.attr("transform", "rotate(-90)" );

                //svg.append("g")
                //    .attr("class", "y axis")
                //    .call(yAxis)
                //    .append("text")
                //    .attr("transform", "rotate(-90)")
                //    .attr("y", 5)
                //    .attr("dy", ".71em")
                //    .style("text-anchor", "end")
                //    .text("Frequency");

                // Add bar chart
                svg.selectAll("bar")
                    .data(data)
                    .enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d) { return x(d.year) + 4; })
                    .attr("width", x.step() - 8)
                    .attr("y", function(d) { return y(d.literature_number); })
                    .attr("height", function(d) { return height - y(d.literature_number); });

                var xAxisText = svg.append('g');

                xAxisText.selectAll("text")
                    .data(data)
                    .enter().append("text")
                    .text(function(d){ return d.literature_number; })
                    .attr("x", function(d) { return x(d.year) + x.step() / 2; })
                    .attr("y", function(d) { return y(d.literature_number) -7; })
                    .attr("class", "text")
                    .attr("text-anchor", "middle");

                $translate('theGbifNetwork.chartPublicationYearly').then(function (translation){
                    svg.append('g')
                        .append("text")
                        .attr("x", width / 2)
                        .attr("y", height + margin.top + 5)
                        .attr("text-anchor", "middle")
                        .attr("class", "chart-title")
                        .text(translation);
                });

            }, function(error){
                return error;
            });
    }


}

module.exports = literatureBarChartYearly;
