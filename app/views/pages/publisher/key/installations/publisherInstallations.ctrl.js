'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('publisherInstallationsCtrl', publisherInstallationsCtrl);

/** @ngInject */
function publisherInstallationsCtrl() {
    var vm = this;
}

module.exports = publisherInstallationsCtrl;
