'use strict';
var angular = require('angular');
var _ = require('lodash');
require('../../../../components/phylotree/phylotree.directive');

angular
  .module('portal')
  .controller('datasetKeyPhylotreeCtrl', datasetKeyPhylotreeCtrl);

/** @ngInject */
function datasetKeyPhylotreeCtrl($state, env, $stateParams, OccurrenceSearch, OccurrenceFragment) {
  var vm = this;
  vm.$state = $state;
  vm.key = $stateParams.key;
  vm.dataApi = env.dataApi;
  var firstOccurrence = OccurrenceSearch.query({dataset_key: vm.key, limit: 1});

  firstOccurrence.$promise.then(function() {
    var dynProps = _.get(firstOccurrence, 'results[0].dynamicProperties');
        try {
            var dynamicProperties = JSON.parse(dynProps);
            if (dynamicProperties.phylogenies) {
                vm.phylogenies = dynamicProperties.phylogenies;
            }
        } catch (err) {
            // Invalid json
        }
      OccurrenceFragment.get({id: _.get(firstOccurrence, 'results[0].key')}).$promise.then(function(fragment) {
         vm.fragment = fragment;
         if (!vm.phylogenies) {
          vm.phylogenies = [{
            phyloTreeTipLabel: _.get(fragment, 'phyloTreeTipLabel'),
            phyloTreeFileName: _.get(fragment, 'phyloTreeFileName')
          }];
        }
      });
  });
}

module.exports = datasetKeyPhylotreeCtrl;
