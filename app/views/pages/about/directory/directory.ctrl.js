'use strict';
var angular = require('angular');
require('./contactsNav');

angular
    .module('portal')
    .controller('directoryCtrl', directoryCtrl);

/** @ngInject */
function directoryCtrl(DirectoryContacts) {
    var vm = this;
    vm.state = {'loaded': false};

    DirectoryContacts.get().$promise.then(function(response){
        vm.state.loaded = true;
        return vm.contacts = response;
    }, function(error){
        return error;
    });

    vm.searchTerm = '';
    vm.searchResults = [];

    vm.toggleStatus = {};
    vm.toggleDetail = function(personId) {
        // true means show
        if (vm.toggleStatus[personId] && vm.toggleStatus[personId] == 'contact--show') {
            vm.toggleStatus[personId] = false;
        }
        else {
            vm.toggleStatus[personId] = 'contact--show';
        }
    };

    vm.searchOnEnter = function (event) {
        if (event.which === 13) {
            vm.typeaheadSelect(vm.selected);
        }
    };

    vm.typeaheadSelect = function (item) { //  model, label, event
        if (angular.isUndefined(item) || angular.isUndefined(item.key)) return;
        var searchString = item.key.toString();
        if (searchString !== '' && vm.query.indexOf(searchString) < 0) {
            vm.selected = '';
        }
    };

}

module.exports = directoryCtrl;