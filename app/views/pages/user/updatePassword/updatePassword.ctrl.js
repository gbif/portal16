'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('updatePasswordCtrl', updatePasswordCtrl);

/** @ngInject */
function updatePasswordCtrl(User) {
    var vm = this;

    vm.update = function () {
        if (vm.pw === vm.repeatedPw) {
            vm.notIdentical = false;
            User.updateForgottenPassword({
                password: vm.pw,
                challengeCode: vm.challengeCode,
                userName: vm.userName
            }).then(function () {
                //will redirect from User service
            }, function () {
                //TODO inform user that the attept to update the password failed. toast probably
            });
        } else {
            vm.notIdentical = true;
        }
    }
}


module.exports = updatePasswordCtrl;
