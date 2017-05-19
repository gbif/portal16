'use strict';

var angular = require('angular'),
    utils = require('../../../shared/layout/html/utils/utils');

require('./text/submenu');
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

    function formatAsPercentage(part, total) {
        var percentage = part * 100 / total,
            formatedPercentage = 0;
        if (percentage == 100) {
            formatedPercentage = 100;
        } else if (percentage >= 99.9) {
            formatedPercentage = 99.9;
        } else if (percentage > 99) {
            formatedPercentage = percentage.toFixed(1);
        } else if (percentage >= 1) {
            formatedPercentage = percentage.toFixed();
        } else if (percentage >= 0.01) {
            formatedPercentage = percentage.toFixed(2);
        } else if (percentage < 0.01 && percentage != 0) {
            formatedPercentage = 0.01;
        }
        return formatedPercentage;
    }

    $localStorage.displayPreferences = vm.displayPreferences;
}

module.exports = datasetKeyCtrl;
