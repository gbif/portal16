'use strict';

var angular = require('angular');
require('../../../../components/grbioPerson/grbioPerson.directive');

angular
    .module('portal')
    .controller('grbioPersonKeyCtrl', grbioPersonKeyCtrl);

/** @ngInject */
function grbioPersonKeyCtrl(Page, $state, $stateParams, PersonKey, InstitutionKey, CollectionKey, InstitutionSearch, CollectionSearch) {
    var vm = this;
    vm.limit = 20;
    vm.offset = parseInt($stateParams.offset);
    vm.q = $stateParams.q;
    Page.setTitle('Person');
    Page.drawer(false);
    vm.key = $stateParams.key;
    vm.$state = $state;
    vm.person = PersonKey.get({key: vm.key});
    vm.showAffiliations = false;
    vm.person.$promise
        .then(function(data) {
            Page.setTitle('Person');
            if (data.primaryInstitutionKey) vm.institution = InstitutionKey.get({key: data.primaryInstitutionKey});
            if (data.primaryCollectionKey) vm.collection = CollectionKey.get({key: data.primaryCollectionKey});
            vm.showAffiliations = vm.showAffiliations || data.primaryInstitutionKey || data.primaryCollectionKey;

            InstitutionSearch.query({contact: vm.key}).$promise
                .then(function(data) {
                    vm.affiliateInstitutions = data.results.filter(function(x) {
                        return x.key !== vm.person.primaryInstitutionKey;
                    });
                    vm.showAffiliations = vm.showAffiliations || data.count > 0;
                })
                .catch(function(err) {
                    // TODO handle error
                });
                CollectionSearch.query({contact: vm.key}).$promise
                .then(function(data) {
                    vm.affiliateCollections = data.results.filter(function(x) {
                        return x.key !== vm.person.primaryCollectionKey;
                    });
                    vm.showAffiliations = vm.showAffiliations || data.count > 0;
                })
                .catch(function(err) {
                    // TODO handle error
                });
        })
        .catch(function(err) {

        });
}

module.exports = grbioPersonKeyCtrl;
