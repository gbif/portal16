'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('updateEmailCtrl', updateEmailCtrl);

/** @ngInject */
function updateEmailCtrl(User) {
    var vm = this;

    vm.update = function() {
        User.updateEmail({
            email: vm.email,
            challengeCode: vm.challengeCode,
            userName: vm.userName
        }).then(function() {
            // will redirect from User service
        }, function() {
            // TODO inform user that the attempt to update the email failed. toast probably
        });
    };
}


module.exports = updateEmailCtrl;
