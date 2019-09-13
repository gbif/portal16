'use strict';

var angular = require('angular');
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
    $translate('collection.institution.title').then(function(title) {
        Page.setTitle(title);
    });
    Page.drawer(false);
    vm.key = $stateParams.key;
    vm.$state = $state;
    vm.institution = InstitutionKey.get({key: vm.key});
    vm.collections = CollectionSearch.query({institution: vm.key});
    // vm.institution.$promise
    //     .then(function(data) {
    //         Page.setTitle('Institution');
    //         vm.institution = InstitutionKey.get({key: data.institutionKey});
    //     })
    //     .catch(function(err) {

    //     });
}

module.exports = institutionKeyCtrl;
