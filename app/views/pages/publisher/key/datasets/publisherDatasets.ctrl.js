'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('publisherDatasetsCtrl', publisherDatasetsCtrl);

/** @ngInject */
function publisherDatasetsCtrl() {
    var vm = this;
}

module.exports = publisherDatasetsCtrl;
