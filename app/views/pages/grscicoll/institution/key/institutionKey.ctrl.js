'use strict';

var angular = require('angular');
var _ = require('lodash');
require('./metrics/institutionKeyMetrics.ctrl');
require('../../../../components/grscicollPerson/grscicollPerson.directive');

angular
    .module('portal')
    .controller('institutionKeyCtrl', institutionKeyCtrl);

/** @ngInject */
function institutionKeyCtrl(Page, $state, $stateParams, InstitutionKey, CollectionSearch, OccurrenceSearch, $translate) {
    var vm = this;
    vm.limit = 20;
    vm.offset = parseInt($stateParams.offset);
    vm.q = $stateParams.q;

    Page.drawer(false);
    vm.key = $stateParams.key;
    vm.$state = $state;
    vm.institution = InstitutionKey.get({key: vm.key});
    vm.collections = CollectionSearch.query({institution: vm.key});
    vm.occurrences = OccurrenceSearch.query({institution_key: vm.key, limit: 0});

    vm.institution.$promise
        .then(function(data) {
          Page.setTitle(data.name);
          var irnIdentifier = _.find(data.identifiers, function(x) {
            return x.type === 'IH_IRN';
          });
          if (irnIdentifier) {
            vm.irn = irnIdentifier.identifier.substr(12);
          }
          data.identifiers.forEach(function(x) {
            if (x.identifier.indexOf('http') !== 0) {
              if (x.type === 'ROR') {
                x.identifier = 'https://ror.org/' + x.identifier;
              }
              if (x.type === 'GRID') {
                x.identifier = 'https://grid.ac/institutes/' + x.identifier;
              }
            }
          });
        })
        .catch(function() {
          // ignore failures
        });
}

module.exports = institutionKeyCtrl;
