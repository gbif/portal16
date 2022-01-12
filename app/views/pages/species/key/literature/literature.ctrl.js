'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('speciesKeyLiteratureCtrl', speciesKeyLiteratureCtrl);

/** @ngInject */
function speciesKeyLiteratureCtrl($stateParams, ResourceSearch) {
    var vm = this;
    vm.key = $stateParams.key;
    vm.limit = 50;
    vm.locale = gb.locale;
    
    ResourceSearch.query({gbifTaxonKey: vm.key, contentType: 'literature', limit: vm.limit}, function(data) {
        vm.literature = data;
    }, function() {
        // TODO handle request error
    });
}

module.exports = speciesKeyLiteratureCtrl;
