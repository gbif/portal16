'use strict';

var angular = require('angular'),
  _ = require('lodash');

angular
  .module('portal')
  .directive('publisherDatasetTable', publisherDatasetTableDirective);

/** @ngInject */
function publisherDatasetTableDirective() {
  var directive = {
    restrict: 'E',
    templateUrl: '/templates/components/pageComponents/publisherDatasetTable/publisherDatasetTable.html',
    scope: {
      settings: '@',
      title: '@',
    },
    controller: publisherDatasetTableCtrl,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;

  /** @ngInject */
  function publisherDatasetTableCtrl(GraphQLGet, URL_PREFIX) {
    var vm = this;
    vm.loading = true;
    vm.locale = gb.locale;
    vm.config = {};

    try {
      vm.config = JSON.parse(vm.settings);
    } catch (e) {
      console.warn('Could not parse settings', e);
    }
    vm.offset = 0;
    vm.limit = vm.config.limit || 20;
    vm.tableStyle = vm.config.tableStyle || '';
    vm.urlPrefix = URL_PREFIX;

    // check if there is a column in the config of type "NAMEPSACE" and if so use the name
    if (vm.config.columns) {
      vm.config.columns.forEach(function (col) {
        if (col.type === 'NAMESPACE') {
          vm.nameSpaceName = col.name;
        }
      });
    }

    function loadData() {
      var response = GraphQLGet.get({
        query: `query($machineTagNamespace: String, $machineTagName: String, $country: Country, $limit: Int, $offset: Int) {
      datasetList(machineTagNamespace: $machineTagNamespace, machineTagName: $machineTagName, limit: $limit, offset: $offset, country: $country) {
        count
        offset
        limit
        results {
          key
          title
          publishingOrganization {
            title
            country
          }
          excerpt
          occurrenceCount
          literatureCount
          machineTags(namespace: $machineTagNamespace, name: $machineTagName) {
            name
            value
          }
        }
      }
      organizationSearch(machineTagNamespace: $machineTagNamespace, machineTagName: $machineTagName, limit: $limit, offset: $offset, country: $country) {
        count
        offset
        limit
        results {
          key
          title
          excerpt
          country
          numPublishedDatasets
          occurrenceCount
          literatureCount
          machineTags(namespace: $machineTagNamespace, name: $machineTagName) {
            name
            value
          }
        }
      }
    }`, variables: {
          machineTagNamespace: vm.config.machineTagNamespace,
          machineTagName: vm.nameSpaceName,
          limit: vm.limit,
          offset: vm.offset,
        }
      });

      response.$promise.then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available

        // datasets and organizations to same type of structure {type: 'dataset', key: '123', title: 'title', excerpt: 'excerpt', country, machineTags: [{name: 'name', value: 'value'}]}, various counts
        vm.loading = false;
        let datasets = response.data.datasetList.results.map(function (d) {
          d.type = 'dataset';
          d.url = '/dataset/' + d.key;
          d.datasetCount = 1;
          d.country = _.get(d, 'publishingOrganization.country');
          return d;
        });
        let publishers = response.data.organizationSearch.results.map(function (d) {
          d.type = 'organization';
          d.url = '/publisher/' + d.key;
          d.datasetCount = d.numPublishedDatasets;
          return d;
        });
        // concatenate datasets and publishers and sort by title
        vm.results = _.sortBy(datasets.concat(publishers), 'title');
        vm.count = response.data.datasetList.count + response.data.organizationSearch.count;
        vm.limit = response.data.datasetList.limit;
        vm.offset = response.data.datasetList.offset;
        vm.largestCount = Math.max(response.data.datasetList.count, response.data.organizationSearch.count);

        // summarize counts for datasetCount, occurrenceCount and literatureCount
        vm.summaryCounts = {
          rowCount: vm.results.length,
          datasetCount: _.sumBy(vm.results, 'datasetCount'),
          occurrenceCount: _.sumBy(vm.results, 'occurrenceCount'),
          literatureCount: _.sumBy(vm.results, 'literatureCount')
        };
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });
    }
    loadData();

    // takes an iso string and returns a year
    vm.translatedValue = function (value) {
      return vm.config.valueTranslations[value] || value;
    }

    function updatePaginationCounts() {
      vm.maxSize = 5;
      vm.currentPage = Math.floor(vm.offset / vm.limit) + 1;
    }
    updatePaginationCounts();
    vm.pageChanged = function () {
      vm.offset = (vm.currentPage - 1) * vm.limit;
      loadData();
    };
  }
}

module.exports = publisherDatasetTableDirective;

