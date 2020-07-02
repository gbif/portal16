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
            species: '='
        }
    };
    return directive;

    /** @ngInject */
    function wikipediaSummaryCtrl($http) {
        var vm = this;

        $http({
            method: 'get',
            url: '/api/wikipedia/page/' + vm.species.canonicalName.replace(/\s/g, '_') + '/summary' + '?locale=' + gb.locale
        }).then(function(res) {
            vm.localeNotFound = !res.data[gb.locale];
            vm.summary = vm.localeNotFound ? _.get(res, 'data.en') : res.data[gb.locale];
            console.log(vm.summary)
        });
    }
}

module.exports = wikipediaSummaryDirective;

