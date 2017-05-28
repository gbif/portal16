'use strict';

var angular = require('angular'),
    utils = require('../../../shared/layout/html/utils/utils');

require('./main/prose/submenu');
require('../../species/key/directives/taxBrowser.directive.js');

angular
    .module('portal')
    .controller('datasetKeyCtrl', datasetKeyCtrl);

/** @ngInject */
function datasetKeyCtrl($localStorage, OccurrenceSearch, SpeciesSearch) {
    var vm = this;
    vm.bibExpand = {
        isExpanded: false
    };
    vm.key = gb.datasetKey.key; //TODO what would be a better way to do this? an bootstraped constant possibly?

    vm.occurrences = OccurrenceSearch.query({dataset_key: vm.key, limit:0});
    vm.images = OccurrenceSearch.query({dataset_key: vm.key, media_type:'StillImage'});
    vm.images.$promise.then(function(resp){
        utils.attachImages(resp.results);
    });
    vm.withCoordinates = OccurrenceSearch.query({dataset_key: vm.key, has_coordinate: true, has_geospatial_issue: false, limit:0 });
    vm.withoutTaxon = OccurrenceSearch.query({dataset_key: vm.key, issue: 'TAXON_MATCH_NONE', limit:0 });
    vm.withYear = OccurrenceSearch.query({dataset_key: vm.key, year: '*,3000', limit:0 });

    vm.taxa = SpeciesSearch.query({dataset_key: vm.key, facet: 'rank', limit:0 });

    vm.displayPreferences = $localStorage.displayPreferences;

    vm.displayPreferences = {
        datasetKey: {
            highlights: ['homepage']
        }
    };

    $localStorage.displayPreferences = vm.displayPreferences;
}

module.exports = datasetKeyCtrl;