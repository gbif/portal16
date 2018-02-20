'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('speciesReferencesCtrl', speciesReferencesCtrl);

/** @ngInject */
function speciesReferencesCtrl($stateParams, SpeciesReferences) {
    var vm = this;
    vm.references = [];

    var citeFunc = function(r) {
        return r.citation;
    };
    SpeciesReferences.query({
        id: $stateParams.key,
        limit: 200
    }, function(data) {
        vm.references = _.sortedUniqBy(_.sortBy(data.results, citeFunc), citeFunc);
    }, function() {
    });
}

module.exports = speciesReferencesCtrl;
