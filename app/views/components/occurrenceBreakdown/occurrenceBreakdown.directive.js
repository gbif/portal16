/*
end result:
create chart by setting dimension and optional chart type and other configuration.
change chart dimension and type and config as you see fit.
enable active filtering. If on, then default to occSearch link if no listener provided

config: what dimensions are supported. what types are supported for each type. default type per dimension. ...
        types:
            Print options per type
            supported dimensions

(de)serializer: compact representation of a chart that can be added to the url

transformers/chart formatting: transform the api result to the formats required by the charting library

Optional filter update (provide a filter the directive should listen to)

print options

What it does not do:
    it isn't the interface for selecting and configuring the chart. it is the chart/table only.
    This is because we do not necessarily want the chart to be changeable. For that there is another directive that makes use of this one.

API:
    the chart expose the action you can perform: del, supported types, downloads, change dimension?

Header helper (seperate directive)
    for creating the header with name and configurable options (chart type changing, downloads etc.)

Builder:
    choose dimension (auto selects a type)
    user can change chart type
    user can change dimension.
    future: user can add a dimension
 */

'use strict';


var angular = require('angular');
var _ = require('lodash');
var config = require('./config');
var serializer = require('./serializer');

require('./header/occurrenceBreakdownHeader.directive');

angular
    .module('portal')
    .directive('occurrenceBreakdown', occurrenceBreakdownDirective);

/** @ngInject */
function occurrenceBreakdownDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/occurrenceBreakdown/occurrenceBreakdown.html?v=' + BUILD_VERSION,
        scope: {
            options: '=',
            api: '='
        },
        link: chartLink,
        controller: occurrenceBreakdown,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function chartLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function occurrenceBreakdown($timeout, $state, $scope, OccurrenceBreakdown, Highcharts) {
        var vm = this;
        var UPDATE_DELAY_TIME = 500;
        vm.state = {
            type: 'BAR',
            offset: 0,
            limit: 10
        };

        $scope.create = function(element) {
            vm.chartElement = element[0].querySelector('.chartArea');
            vm.dimension = vm.options.dimension;
            vm.secondDimension = vm.options.secondDimension;
            updateChart();
        };

        /**
         * update the chart to match the dimension, config
         */
        function updateChart() {
            // Validate provided options. If wrong, then show an error message instead
            updateContent();
            var str = serializer.serialize(vm.dimension, vm.options.type, 0, 0, 10);
            console.log(str);
            console.log(serializer.deserialize(str));
        }

        function updateContent() {
            // Validate provided options. If wrong, then show an error message instead
            var q = _.assign(vm.options.filter,
                    {dimension: vm.dimension, secondDimension: vm.secondDimension},
                    _.get(config, 'dimensionParams[' + vm.dimension + ']', {offset: vm.state.offset, limit: vm.state.limit})
            );
            if (vm.content && vm.content.$cancelRequest) {
                vm.content.$cancelRequest();
            }
            vm.content = OccurrenceBreakdown.query(q);
            vm.content.$promise
                .then(function(response) {
                    vm.chartdata = response;// 'chart data after transform of the data response';
                })
                .catch(function(err) {
                    if (err.status !== -1) {
                        console.error('failed to load data : ' + err);
                    }
                });
        }

        vm.nextPage = function() {
            vm.state.offset = vm.state.offset + vm.state.limit;
            updateContent();
        };

        vm.prevPage = function() {
            vm.state.offset = Math.max(0, vm.state.offset - vm.state.limit);
            updateContent();
        };

        vm.level = function(val) {
            console.log(val);
            return Math.ceil((val - vm.chartdata.min) / ((vm.chartdata.max - vm.chartdata.min) / 10));
        };

        function changeChartType(type) {
            console.log('chart type changed to ' + type);
            vm.state.type = type;
        }

        vm.getFacetFilter = function(filter) {
            return _.assign({}, vm.options.filter, filter);
        };

        /* WATCH FILTERS FOR CHANGES */
        var delayedFilterTimer;

        $scope.$watchCollection(function() {
            return vm.options.filter;
        }, function() {
            $timeout.cancel(delayedFilterTimer);
            vm.pendingUpdate = true;
            delayedFilterTimer = $timeout(function() {
                updateChart();
            }, UPDATE_DELAY_TIME);
        });

        $scope.$watch(function() {
            return vm.options.dimension;
        }, function() {
            vm.dimension = vm.options.dimension;
            updateContent();
        });

        $scope.$watch(function() {
            return vm.options.type;
        }, function() {
            vm.type = vm.options.type;
        });

        /* GENERATE API TO EXPOSE TO DIRECTIVE USER */
        // consider splitting in to seperate file
        if (vm.api) {
            vm.api.download = function() {
                console.log('this will download the chart');
            };

            vm.api.getDimension = function() {
                // console.log(vm.options);
                return vm.dimension;
            };

            vm.api.setDimension = function(dimension) {
                vm.dimension = dimension;
            };

            vm.api.setChartType = function(type) {
                if (config.supportedTypes[vm.dimension].indexOf(type) > -1) {
                    changeChartType(type);
                } else {
                    console.log('Attempting to change to a not supported chart type - request ignored');
                }
            };

            // vm.api.isSupported = function() {
            //     console.log(vm.options);
            //     return vm.dimension;
            // };

            vm.api.options = config;

            vm.api.hello = 'Hello from the chart directive API';

            if (Object.freeze) {
                Object.freeze(vm.api);
            }
        }

        /* CLEANUP ON DESTROY */
        // When the DOM element is removed from the page,
        // AngularJS will trigger the $destroy event on
        // the scope. This is a good time to cancel timers and requests
        $scope.$on('$destroy', function() {
                $timeout.cancel(delayedFilterTimer);
            }
        );
    }
}

/*
 * OVERALL IDEA
 * for any occ filter.
 * define a field of a fixed subset (BoR, year, month, species?, latitude? decade? ...)
 * depending on type a fixed number of chart types.
 * Basically simlpy filter as is. add facet as per selected field. If key, then resolve. could start with only allowing enums.
 * defaults to bar chart. doughnut if single value per type. BoR or kingdom fx. Issue not.
 * for bar charts only?: similar to table layout: if several species (or another type) selected, then do breakdown per type? months fx.
 * so basically. choose field (say months). defaults to counts per month, but option to choose counts per other field per month - fx selected species or all of an enum
 *
 *
 * CHART TYPES
 * bar chart.
 * pie.
 * map country chloropleth
 * plain list? seems useful for issues fx (almost just a vertical bar chart).
 * table. choose additional dimension. At least one enum (else we cannot write 'other').
 *        iterate enums and add to filter (overwrite enum filter if already there)) and facet per other dimension. also do a plain facet on enum diff is other.
 *
 * MORE
 * more button for more facets (increase facetLimit). always ask for one more facet than asked for to decide on showing more button.
 *
 * INTERACTIVE
 * labels optional clickable to add as filter.
 *
 * SPECIAL CASES
 * taxonomy special case. interactive widget.
 * Years (and elevation and other continuous numbers) seem special as well in that you would typically want them not ordered by count, but in order.
 *
 * Years (and other continuous nr)
 * seems tricky. How to handle this?
 * Start by asking for facets with a large number, say 500. If there are more, then find extend first by asking for extremes and dividing in half?
 * Then select an appropriate interval?
 * Then filter per interval to get counts.
 *
 * fullscreen? download image/pdf? download csv data? how about citation then?
 *
 */

/*
 * Have a fixed set of allowed dimensions that is supported.
 * for each dimension a set of configuration options
 *
 * fx chart options: bar, pie, line, ...
 * and for each type (or generic) there is defaults/suggestions based on type and data.
 *
 * cases:
 * no data : show text
 * 1 value : show styled box
 * few values : pie or bar or column as default. table, line as options
 * standard : bar or column as default. pie, line, table
 * many values : line or table as default. bar as option ?
 *
 * views could be: pie, bar, line, table, column
 */

module.exports = occurrenceBreakdownDirective;
