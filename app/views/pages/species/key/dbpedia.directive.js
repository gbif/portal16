'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('dbpedia', dbpediaDirective);

/** @ngInject */
function dbpediaDirective() {
    var directive = {
        restrict: 'E',
        template: '<p class="db-pedia">{{vm.abstract}}</p>',
        scope: {},
        controller: dbpediaCtrl,
        controllerAs: 'vm',
        bindToController: {
            name: '@',
            lang: '@'
        }
    };
    return directive;

    /** @ngInject */
    function dbpediaCtrl(DbPedia) {
        var vm = this;
        vm.abstract = '';
        vm._name = vm.name.replace(" ", "_");

        DbPedia.query({
            name: vm._name

        }, function (data) {
            var dbPediaResource = "http://dbpedia.org/resource/" + vm._name;
            if (data && dbPediaResource in data) {
                var res = data[dbPediaResource];
                var abstractEn;
                _.some(res['http://www.w3.org/2000/01/rdf-schema#comment'], function (abstr) {
                    if (abstr.lang == vm.lang) {
                        vm.abstract = abstr.value;
                    }
                    if (abstr.lang == 'en') {
                        abstractEn = abstr.value;
                    }
                    return abstr.lang == vm.lang;
                });
                vm.abstract = vm.abstract ? vm.abstract : abstractEn;

            }
        }, function () {
        });
    }
}

module.exports = dbpediaDirective;

