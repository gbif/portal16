'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('occurrenceDownloadKeyCtrl', occurrenceDownloadKeyCtrl);

/** @ngInject */
function occurrenceDownloadKeyCtrl($state) {
    var vm = this;
    vm.HUMAN = true;
}

module.exports = occurrenceDownloadKeyCtrl;
