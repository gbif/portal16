'use strict';

var _ = require('lodash');
var mapHelper = require('./map');


angular
    .module('portal')
    .controller('speciesPopulationCtrl', speciesPopulationCtrl);

/** @ngInject */
function speciesPopulationCtrl($http, suggestEndpoints) {
    var vm = this;
    vm.lowerTaxon;
    vm.higherTaxonArray = [];
    vm.minimumYears = '10';
    vm.suggestTemplate = '/templates/components/filterTaxon/suggestTaxonTemplate.html';

    mapHelper.createMap();
    mapHelper.addMapEvents({
        onCreate: function(e) {
            console.log('draw creation event triggered from directive');
            console.log(e);
        },
        onUpdate: function(e) {
            console.log('drawn polygon updates');
        },
        onDelete: function(e) {
            console.log('draw deletion');
        }
    });

    vm.getSuggestions = function (val) {
        return $http.get(suggestEndpoints.taxon, {
            params: {
                q: val.toLowerCase(),
                limit: 10
            }
        }).then(function (response) {
            return response.data;
        });
    };

    vm.updateMap = function() {
        mapHelper.updateOverlays(vm.higherTaxon.key, vm.lowerTaxon.key, vm.minimumYears);
    };

    vm.setLowerTaxon = function (item) {
        //if nothing selected then do not do anything
        if (angular.isUndefined(item)) return;
        vm.lowerTaxon = item;

        if (item.rank == 'KINGDOM') {
            //it doesn't make sense to choose a kingdom. And maybe we should even set the bar lower
            return;
        } else {

            //transform higherClassificationMap to array and sort it by key. select largest key - the assumption being that it is the lowest rank
            var higherArray = _.map(vm.lowerTaxon.higherClassificationMap, function (name, key) {
                return {key: parseInt(key), name: name};
            });
            higherArray = _.sortBy(higherArray, 'key');
            vm.higherTaxonArray = higherArray;
            vm.higherTaxon = higherArray[higherArray.length - 1];

            //update the map to reflect the new selection
            vm.updateMap();
        }
    };
}


module.exports = speciesPopulationCtrl;
