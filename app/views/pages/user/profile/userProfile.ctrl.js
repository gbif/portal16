'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('userProfileCtrl', userProfileCtrl);

/** @ngInject */
function userProfileCtrl(User) {
    var vm = this;
    vm.test = 'hej';
}

module.exports = userProfileCtrl;
