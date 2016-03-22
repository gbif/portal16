'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('searchCtrl', searchCtrl);

/** @ngInject */
function searchCtrl(hotkeys) {
    var vm = this;
    vm.test = 0;
    vm.compactTaxonResult = true;
    vm.selectedTaxonId;
    vm.searchQuery;

    //might be interesting to look at: http://chieffancypants.github.io/angular-hotkeys/
    hotkeys.add({
        combo: 'alt+f',
        description: 'Site search',
        callback: function(event) {
            document.getElementById('siteSearch').focus();
            vm.searchQuery = '';
            event.preventDefault();
        }
    });
}

module.exports = searchCtrl;