'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('confirmUserCtrl', confirmUserCtrl);

/** @ngInject */
function confirmUserCtrl($cookies, User) {
    var vm = this;
    vm.destinationUrl = $cookies.get('userCreationUrl');
    if (vm.destinationUrl.indexOf('/user/') > -1) {
        vm.destinationUrl = undefined;
    }
    $cookies.remove('userCreationUrl');
    User.loadActiveUser();
}

module.exports = confirmUserCtrl;

