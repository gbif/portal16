'use strict';

var angular = require('angular');
var _ = require('lodash');
require('./metrics/collectionKeyMetrics.ctrl');
require('../../../../components/grscicollPerson/grscicollPerson.directive');

angular
    .module('portal')
    .controller('collectionKeyCtrl', collectionKeyCtrl);

/** @ngInject */
function collectionKeyCtrl(Page, $state, $stateParams, CollectionKey, OccurrenceSearch, InstitutionKey, $translate) {
    var vm = this;
    vm.limit = 20;
    vm.offset = parseInt($stateParams.offset);
    vm.q = $stateParams.q;
    $translate('collection.headerTitle').then(function(title) {
        Page.setTitle(title);
    });
    Page.drawer(false);
    vm.key = $stateParams.key;
    vm.$state = $state;
    vm.collection = CollectionKey.get({key: vm.key});
    vm.occurrences = OccurrenceSearch.query({collection_key: vm.key, limit: 0});

    vm.collection.$promise
        .then(function(data) {
            Page.setTitle(vm.collection.title);
            vm.institution = InstitutionKey.get({key: data.institutionKey});
            
            // get Index Herbariorum IRN
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
              }
            });
        })
        .catch(function(err) {

        });
}

module.exports = collectionKeyCtrl;
