'use strict';

var angular = require('angular'),
    _ = require('lodash');

require('./datasets/publisherDatasets.ctrl');
require('./installations/publisherInstallations.ctrl');

angular
    .module('portal')
    .controller('publisherKeyCtrl', publisherKeyCtrl);

/** @ngInject */
function publisherKeyCtrl() {
    var vm = this;
    vm.test = 'hej';
}

module.exports = publisherKeyCtrl;