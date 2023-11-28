'use strict';
var angular = require('angular');
var _ = require('lodash');
require('../../../../components/phylotree/phylotree.directive');

angular
  .module('portal')
  .controller('occurrenceKeyPhylotreeCtrl', occurrenceKeyPhylotreeCtrl);

/** @ngInject */
function occurrenceKeyPhylotreeCtrl($q, $http, $state, env, $stateParams, Occurrence, OccurrenceFragment) {
  var vm = this;
  vm.$state = $state;
  vm.key = $stateParams.key;
  vm.dataApi = env.dataApi;

  $q.all({
    occurrence: Occurrence.get({id: vm.key}).$promise/* ,
    fragment: OccurrenceFragment.get({id: vm.key}).$promise  */
  }).then(function(res) {
        vm.occurrence = res.occurrence;
        if ( _.get(vm.occurrence, 'dynamicProperties')) {
          try {
             var dynProps = JSON.parse(_.get(vm.occurrence, 'dynamicProperties'));
             if (dynProps['phyloTreeFileName'] ) {
              vm.phyloTreeFileName = dynProps['phyloTreeFileName'];
             }
             if (dynProps['phyloTreeTipLabel'] ) {
              vm.phyloTreeTipLabel = dynProps['phyloTreeTipLabel'];
             }
          } catch (err) {
              // unparsable JSON
          }
      }
      if (!vm.phyloTreeTipLabel && !vm.phyloTreeFileName) {
       return $q.all({
          fragment: OccurrenceFragment.get({id: vm.key}).$promise  
        });
      }
  })
  .then(function(res) {
  if (!vm.phyloTreeTipLabel && !vm.phyloTreeFileName) {
    vm.phyloTreeTipLabel = _.get(res, 'fragment.phyloTreeTipLabel');
    vm.phyloTreeFileName = _.get(res, 'fragment.phyloTreeFileName');
  }
})
  .catch(function(err) {
    console.log(err);
  });
  /* function getFragment() {
    $http.get(vm.dataApi + 'occurrence/' + vm.key + '/fragment', {})
                .then(function(response) {
                   vm.fragment = response.data;
                }).catch(function(err) {
                    console.log(err);
                // swallow errors
            });
}
getFragment(); */
}

module.exports = occurrenceKeyPhylotreeCtrl;
