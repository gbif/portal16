'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('speciesKeyCtrl', speciesKeyCtrl);

/** @ngInject */
function speciesKeyCtrl(leafletData, env, moment, $http, hotkeys) {
    var vm = this;
    vm.mediaExpand = {
        isExpanded: false
    };
    vm.hideDetails = true;
    vm.mediaItems = {};
    vm.dataApi = env.dataApi;

    //TODO: query db-pedia http://dbpedia.org/data/Abies_alba.json
    vm.abtract = 'Abies alba, the European silver fir or silver fir, is a fir native to the mountains of Europe, from the Pyrenees north to Normandy, east to the Alps and the Carpathians, Slovenia, Croatia, Bosnia and Herzegovina, Serbia and south to southern Italy, Bulgaria and northern Greece.';

    //TODO: query redlist
    // marine_system/ freshwater_system/ terrestrial_system
    // http://apiv3.iucnredlist.org/api/v3/species/loxodonta%20africana?token=9bb4facb6d23f48efbf424bb05c0c1ef1cf6f468393bc745d42179ac4aca5fee
    vm.redlistStatus = '';

    //TODO: query cites
    vm.cites = '';

    //TODO: query EOL ???
    vm.cites = '';

    hotkeys.add({
        combo: 'alt+d',
        description: 'Show record details',
        callback: function () {
            vm.hideDetails = !vm.hideDetails;
            vm.expandMore = false;
        }
    });
}

module.exports = speciesKeyCtrl;
