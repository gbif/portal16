'use strict';

var angular = require('angular');
var _ = require('lodash');

angular
    .module('portal')
    .directive('wikipediaSummary', wikipediaSummaryDirective);

/** @ngInject */
function wikipediaSummaryDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/wikipediasummary.html',
        scope: {},
        controller: wikipediaSummaryCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@'
        }
    };
    return directive;

    /** @ngInject */
    function wikipediaSummaryCtrl($http) {
        var vm = this;

        $http({
            method: 'get',
            url: '/api/wikipedia/page/' + vm.key + '/summary' + '?locale=' + gb.locale
        }).then(function(res) {
            vm.localeNotFound = !res.data[gb.locale];
            vm.summary = vm.localeNotFound ? _.get(res, 'data.en') : res.data[gb.locale];
        });
    }
}

module.exports = wikipediaSummaryDirective;

