'use strict';

var angular = require('angular');
require('../../../../components/grscicollPerson/grscicollPerson.directive');

angular
    .module('portal')
    .controller('collectionKeyCtrl', collectionKeyCtrl);

/** @ngInject */
function collectionKeyCtrl(Page, $state, $stateParams, CollectionKey, InstitutionKey, $translate) {
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
    vm.collection.$promise
        .then(function(data) {
            Page.setTitle(vm.collection.title);
            vm.institution = InstitutionKey.get({key: data.institutionKey});
        })
        .catch(function(err) {

        });
}

module.exports = collectionKeyCtrl;
