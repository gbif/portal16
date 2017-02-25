'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('userProfileCtrl', userProfileCtrl);

/** @ngInject */
function userProfileCtrl(User) {
    User.loadActiveUser();
}

module.exports = userProfileCtrl;
