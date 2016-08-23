/**
 * search types?
 * auto complete
 * integer is [between, below, above]
 * date interval etc
 * enum list, multiselect
 */
'use strict';
var angular = require('angular');
//require('./components/taxon/taxonExplore.directive');

angular
    .module('portal')
    .controller('occurrenceCtrl', occurrenceCtrl);

/** @ngInject */
function occurrenceCtrl($scope, $state, $stateParams, hotkeys, enums, OccurrenceFilter) {
    var vm = this;
    vm.query = angular.copy($stateParams);
    vm.query.basisOfRecord = vm.query.basisOfRecord ? [].concat(vm.query.basisOfRecord) : [];
    vm.query.typeStatus = vm.query.typeStatus ? [].concat(vm.query.typeStatus) : [];
    vm.hide = true;
    vm.state = $state;


    vm.filters = {
        basisOfRecord: {
            enumValues: enums.basisOfRecord,
            queryKey: 'basisOfRecord',
            title: 'basisOfRecord',
            translationPrefix: 'basisOfRecord'
        }
    };
    vm.filters.typeStatus = {
        enumValues: enums.typeStatus,
        queryKey: 'typeStatus',
        title: 'typeStatus',
        translationPrefix: 'typeStatus'
    };

    vm.filters.month = {
        enumValues: enums.month,
        queryKey: 'month',
        title: 'month',
        translationPrefix: 'month'
    };

    vm.filters.establishmentMeans = {
        enumValues: enums.establishmentMeans,
        queryKey: 'establishmentMeans',
        title: 'establishmentMeans',
        translationPrefix: 'establishmentMeans'
    };

    //suggest filters
    vm.filters.recordedBy = {
        title: 'recordedBy'
    };

    vm.filters.recordNumber = {
        title: 'recordNumber'
    };

    vm.filters.occurrenceId = {
        title: 'occurrenceId'
    };

    vm.filters.catalogNumber = {
        title: 'catalogNumber'
    };

    vm.filters.institutionCode = {
        title: 'institutionCode'
    };

    vm.filters.collectionCode = {
        title: 'collectionCode'
    };


    vm.search = function() {
        $state.go('.', vm.query, {inherit:false, notify: true, reload: true});
        //window.scrollTo(0,0);
    };

    vm.updateSearch = function() {
        vm.query.offset = undefined;
        vm.query.limit = undefined;
        $state.go($state.current, vm.query, {inherit:false, notify: false, reload: false});
    };
    vm.searchOnEnter = function(event) {
        if(event.which === 13) {
            vm.updateSearch();
        }
    };

    vm.clearFreetextAndSetFocus = function() {
        document.getElementById('siteSearch').focus();
        vm.freeTextQuery = '';
    };
    //might be interesting to look at: http://chieffancypants.github.io/angular-hotkeys/
    hotkeys.add({
        combo: 'alt+f',
        description: 'Site search',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function(event) {
            vm.clearFreetextAndSetFocus();
            event.preventDefault();
        }
    });

    hotkeys.add({
        combo: 'alt+enter',
        description: 'Apply',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function(event) {
            vm.updateSearch();
            event.preventDefault();
        }
    });


}

module.exports = occurrenceCtrl;