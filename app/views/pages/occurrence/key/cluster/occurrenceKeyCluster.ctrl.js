'use strict';
var angular = require('angular');

angular
    .module('portal')
    .controller('occurrenceKeyClusterCtrl', occurrenceKeyClusterCtrl);

/** @ngInject */
function occurrenceKeyClusterCtrl($state, OccurrenceSearch) {
    var vm = this;
    vm.$state = $state;
    vm.similarRecords = OccurrenceSearch.query({});

    vm.hasData = function() {
        return true;
    };

    vm.showCol = function() {
        return true;
    };

    vm.columns = ['country', 'coordinates', 'eventDate', 'basisOfRecord', 'dataset', 'issues', 'typeStatus', 'individualCount', 'organismQuantity', 'organismQuantityType', 'sampleSizeUnit', 'sampleSizeValue', 'recordNumber', 'recordedBy', 'catalogNumber', 'collectionCode', 'institutionCode', 'identifiedBy', 'publisher', 'taxonRank', 'kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'species'];// eslint-disable-line max-len
    vm.translationKeyOverwrites = {
        coordinates: 'occurrence.coordinates',
        eventDate: 'occurrence.monthAndyear',
        issues: 'occurrence.issues',
        dataset: 'occurrence.dataset'
    };
}

module.exports = occurrenceKeyClusterCtrl;
