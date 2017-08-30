'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('faqCtrl', faqCtrl);

/** @ngInject */
function faqCtrl($scope, HelpService, Page, $state, $stateParams, $http, ResourceSearch) {
    var vm = this;
    vm.limit = 50;
    vm.maxSize = 5;
    vm.offset = 0;
    vm.state = HelpService.getState();
    vm.question = $stateParams.question;

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

    if ($stateParams.question) {
        vm.question = $stateParams.question;
    }

    vm.showPopup = function(question) {
        $state.go('.', {question: question}, {inherit: true, notify: false, reload: false});
        HelpService.updateState(true, question);
    };

    vm.closePopup = function(){
        vm.question = undefined;
        $state.go('.', {question: undefined}, {inherit: false, notify: false, reload: false});
    };

    $scope.$watchCollection(function () {
        return vm.state;
    }, function () {
        vm.show = vm.state.open;
        if (!vm.show) {
            vm.closePopup();
        }
    });

    if (vm.question) {
        vm.showPopup(vm.question);
    }
}

module.exports = faqCtrl;