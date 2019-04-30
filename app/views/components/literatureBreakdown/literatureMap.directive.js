'use strict';

var angular = require('angular');
var _ = require('lodash');

angular
  .module('portal')
  .directive('literatureMap', literatureMapDirective);

/** @ngInject */
function literatureMapDirective(BUILD_VERSION) {
  var directive = {
    restrict: 'E',
    transclude: true,
    templateUrl: '/templates/components/literatureBreakdown/literatureMap.html?v=' + BUILD_VERSION,
    scope: {
      options: '=',
      display: '=',
      api: '=',
      filter: '='
    },
    link: chartLink,
    controller: literatureMap,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;

  /** @ngInject */
  function chartLink(scope, element) {// , attrs, ctrl
    scope.create(element);
  }

  /** @ngInject */
  function literatureMap($timeout, $state, $scope, ResourceSearch, $translate, $q) {
    var vm = this;
    var UPDATE_DELAY_TIME = 500;
    vm.logarithmic = true;

    $scope.create = function(element) {
      vm.chartElement = element[0].querySelector('.chartArea');
      // vm.dimension = vm.options.dimension;
      // vm.secondDimension = vm.options.secondDimension;
      updateChart();
    };

    /* CLEAN UP ON DESTROY */
    // When the DOM element is removed from the page,
    // AngularJS will trigger the $destroy event on
    // the scope. This is a good time to cancel timers and requests
    $scope.$on('$destroy', function() {
      $timeout.cancel(delayedFilterTimer);
      if (vm.content && vm.content.$cancelRequest) {
        vm.content.$cancelRequest();
      }
    });

    /**
     * update the chart to match the dimension, config
     */
    function updateChart() {
      // Validate provided options. If wrong, then show an error message instead
      updateContent();
    }

    vm.getFilterForAll = function() {
      return _.assign({contentType: 'literature'}, vm.filter);
    };

    function updateContent() {
      if (vm.content && vm.content.$cancelRequest) {
        vm.content.$cancelRequest();
      }
      var q = _.assign({contentType: 'literature', limit: 0, facet: 'year'}, vm.filter);
      vm.content = ResourceSearch.query(q);
      $translate('occurrences');
      $q.all({
        response: vm.content.$promise,
        occurrences_translation: $translate('metrics.occurrences'),
        otherOrUknown_translation: $translate('metrics.otherOrUknown'),
        clickToZoom_translation: $translate('metrics.clickToZoom'),
        pinchToZoom_translation: $translate('metrics.pinchToZoom')
      })
        .then(function(resolved) {
          var response = resolved.response;
          vm.chartdata = response;// 'chart data after transform of the data response';

          vm.translations = {
            occurrences: resolved.occurrences_translation,
            otherOrUknown: resolved.otherOrUknown_translation,
            clickToZoom: resolved.clickToZoom_translation,
            pinchToZoom: resolved.pinchToZoom_translation
          };
          formatData(vm.chartdata);
        })
        .catch(function(err) {
          if (err.status !== -1) {
            console.error('failed to load data : ' + err);
          }
        });
    }

    function formatData(chartdata) {
      if (!chartdata || !chartdata.$resolved) {
        return;
      }
      if (vm.myChart) {
        vm.myChart.destroy();
        vm.myChart = undefined;
      }
      // var columnConfig = columnChartHelper.getConfig(chartdata, vm.chartElement, occurrenceSearch, vm.translations, vm.logarithmic);
      var minYear = _.min(Object.keys(_.get(chartdata, 'facets.YEAR.counts', {2000: null})));
      var categories = _.range(minYear, new Date().getFullYear() + 1);
      var groupPadding = 0;
      var pointPadding = 0;
      vm.chartConfig = {
        chart: {
          type: 'column'
        },
        xAxis: {
          categories: categories,
          crosshair: false
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Citations'
          }
        },
        credits: {
          enabled: false
        },
        title: {
          text: ''
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.y}</b>'
        },
        series: [{
          name: 'Citations',
          data: _.map(categories, function(year) {
            return _.get(chartdata, 'facets.YEAR.counts[' + year + '].count', 0);
          })
        }],
        exporting: {
          buttons: {
            contextButton: {
              enabled: false
            }
          }
        },
        legend: {
          enabled: false
        },
        plotOptions: {
          column: {
            groupPadding: groupPadding,
            pointPadding: pointPadding,
            animation: false,
            point: {
              events: {
                click: function() {
                  var clickedFilter = _.assign({contentType: 'literature'}, vm.filter);
                  _.assign(clickedFilter, {year: categories[this.index]});
                  $state.go('resourceSearchList', clickedFilter);
                }
              }
            }
          }
        }
      };
    }

    /* WATCH FILTERS FOR CHANGES */
    var delayedFilterTimer;

    $scope.$watchCollection(function() {
      return vm.filter;
    }, function() {
      $timeout.cancel(delayedFilterTimer);
      vm.pendingUpdate = true;
      delayedFilterTimer = $timeout(function() {
        updateChart();
      }, UPDATE_DELAY_TIME);
    });
  }
}

module.exports = literatureMapDirective;
