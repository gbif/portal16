'use strict';

let angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('dbpedia', dbpediaDirective);

/** @ngInject */
function dbpediaDirective() {
    let directive = {
        restrict: 'E',
        template: '<p ng-show="vm.abstract" class="db-pedia">{{vm.abstract}}<cite title="DBpedia"><a href="{{vm.link}}">DBpedia</a></cite></p>',
        scope: {},
        controller: dbpediaCtrl,
        controllerAs: 'vm',
        bindToController: {
            name: '@',
            lang: '@',
        },
    };
    return directive;

    /** @ngInject */
    function dbpediaCtrl(DbPedia) {
        let vm = this;
        vm._name = vm.name.replace(' ', '_');

        DbPedia.query({
            name: vm._name,

        }, function(data) {
            let dbPediaResource = 'http://dbpedia.org/resource/' + vm._name;
            if (data && dbPediaResource in data) {
                let res = data[dbPediaResource];
                let abstractEn;
                _.some(res['http://www.w3.org/2000/01/rdf-schema#comment'], function(abstr) {
                    if (abstr.lang == vm.lang) {
                        vm.abstract = abstr.value;
                    }
                    if (abstr.lang == 'en') {
                        abstractEn = abstr.value;
                    }
                    return abstr.lang == vm.lang;
                });
                vm.abstract = vm.abstract ? vm.abstract : abstractEn;
                vm.link = dbPediaResource;
            }
        }, function() {
        });
    }
}

module.exports = dbpediaDirective;

