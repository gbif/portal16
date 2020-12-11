'use strict';

var angular = require('angular');
var _ = require('lodash');
require('../../../../components/grscicollPerson/grscicollPerson.directive');

angular
    .module('portal')
    .controller('institutionKeyCtrl', institutionKeyCtrl);

/** @ngInject */
function institutionKeyCtrl(Page, $state, $stateParams, InstitutionKey, CollectionSearch, $translate) {
    var vm = this;
    vm.limit = 20;
    vm.offset = parseInt($stateParams.offset);
    vm.q = $stateParams.q;

    Page.drawer(false);
    vm.key = $stateParams.key;
    vm.$state = $state;
    vm.institution = InstitutionKey.get({key: vm.key});
    vm.collections = CollectionSearch.query({institution: vm.key});

    vm.institution.$promise
        .then(function(data) {
          Page.setTitle(data.name);
          var irnIdentifier = _.find(data.identifiers, function(x) {
            return x.type === 'IH_IRN';
          });
          if (irnIdentifier) {
            vm.irn = irnIdentifier.identifier.substr(12);
          }
        })
        .catch(function() {
          // ignore failures
        });
}

module.exports = institutionKeyCtrl;
