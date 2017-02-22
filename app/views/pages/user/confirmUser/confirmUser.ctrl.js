'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('confirmUserCtrl', confirmUserCtrl);

/** @ngInject */
function confirmUserCtrl($cookies) {
    var vm = this;
    vm.destinationUrl = $cookies.get('userCreationUrl');
}

module.exports = confirmUserCtrl;

