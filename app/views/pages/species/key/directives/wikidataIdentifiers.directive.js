'use strict';

var angular = require('angular');

angular
    .module('portal')
    .directive('wikidataIdentifiers', wikidataIdentifierDirective);

/** @ngInject */
function wikidataIdentifierDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/wikidataIdentifiers.html',
        scope: {},
        controller: wikidataIdentifierCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@'
        }
    };
    return directive;

    /** @ngInject */
    function wikidataIdentifierCtrl($http) {
        var vm = this;

        $http({
            method: 'get',
            url: '/api/wikidata/species/' + vm.key + '?locale=' + gb.locale
        }).then(function(res) {
            vm.wikidataIdentifiers = res.data.identifiers;
            vm.sourceLink = res.data.wikidataUrl;
            vm.sourceId = res.data.wikidataId;
        });
    }
}

module.exports = wikidataIdentifierDirective;

