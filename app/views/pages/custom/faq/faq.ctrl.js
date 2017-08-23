'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('faqCtrl', faqCtrl);

/** @ngInject */
function faqCtrl(Page, $state, $stateParams, $http, ResourceSearch) {
    var vm = this;
    vm.limit = 50;
    vm.maxSize = 5;
    vm.offset = 0;

    vm.q;

    vm.search = function () {
        vm.answers = ResourceSearch.query({q: vm.q, contentType: 'help', limit: vm.limit, offset: vm.offset});
    };
    vm.search();

    vm.pageChanged = function () {
        vm.offset = (vm.currentPage - 1) * vm.limit;
        vm.search();
        window.scrollTo(0, 0);
    };

    if ($stateParams.helpId) {
        vm.helpId = $stateParams.helpId;
    }

    vm.showPopup = function(helpId) {
        $state.go('.', {helpId: helpId}, {inherit: true, notify: false, reload: false});
    };

    vm.closePopup = function(){
        vm.helpId = undefined;
        $state.go('.', {helpId: undefined}, {inherit: false, notify: false, reload: false});
    };
}

module.exports = faqCtrl;