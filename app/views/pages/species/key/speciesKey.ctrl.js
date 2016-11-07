'use strict';

var angular = require('angular');
require('./directives/cites.directive.js');
require('./directives/redlist.directive.js');
require('./directives/dbpedia.directive.js');
require('./directives/synonyms.directive.js');
require('./directives/combinations.directive.js');
require('../../dataset/key/taxonomy/taxBrowser.directive.js');
require('./directives/related.directive.js');
require('./directives/references.directive.js');
require('./directives/typeSpecimen.directive.js');

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
