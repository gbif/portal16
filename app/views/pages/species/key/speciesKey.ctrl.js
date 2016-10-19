'use strict';

var angular = require('angular');
require('./redlist.directive');
require('./dbpedia.directive');
require('./taxonChildren.directive');

angular
    .module('portal')
    .controller('speciesKeyCtrl', speciesKeyCtrl);

/** @ngInject */
function speciesKeyCtrl(env) {
    var vm = this;

    vm.key = gb.taxon.key;
    vm.name = gb.taxon.name;
    vm.rank = gb.taxon.rank;
    vm.synonym = gb.taxon.synonym;
}

module.exports = speciesKeyCtrl;
