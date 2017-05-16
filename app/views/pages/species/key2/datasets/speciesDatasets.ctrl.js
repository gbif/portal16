'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('speciesDatasetsCtrl', speciesDatasetsCtrl);

/** @ngInject */
function speciesDatasetsCtrl($stateParams) {
    var vm = this;
}

module.exports = speciesDatasetsCtrl;
