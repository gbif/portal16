'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('scientificName', scientificNameDirective);

/** @ngInject */
function scientificNameDirective() {
    var directive = {
        restrict: 'A',
        template: '<span ng-bind-html="vm.parsedName"></span>',
        scope: {},
        controller: scientificNameCtrl,
        controllerAs: 'vm',
        bindToController: {
            key: '@'
        }
    };

    return directive;

    /** @ngInject */
    function scientificNameCtrl(SpeciesName) {
        var vm = this;

        function add(value) {
            return value ? value + ' ' : '';
        }

        SpeciesName.get({id:vm.key}, function(name){
            var n = '';
            if (name.genusOrAbove || name.specificEpithet) {
                n += '<i>' + add(name.genusOrAbove) + add(name.specificEpithet) + '</i>';
            }
            if (name.infraSpecificEpithet) {
                n += add(name.rankMarker) + '<i>' + add(name.specificEpithet) + '</i>';
            }
            if (name.bracketAuthorship || name.bracketYear){
                n += '(' + add(name.bracketAuthorship);
                if (name.bracketAuthorship && name.bracketYear) {
                    n += ', ';
                }
                n += add(name.bracketYear) + ')';
            }
            n += add(name.authorship);
            if (name.authorship && name.year) {
                n += ', ';
            }
            n += add(name.year);

            vm.parsedName = n;
        }, function(err){
            console.log(err);
        });
    }
}

module.exports = scientificNameDirective;

