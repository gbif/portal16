'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('updatePasswordCtrl', updatePasswordCtrl);

/** @ngInject */
function updatePasswordCtrl(User) {
    var vm = this;

    vm.update = function(){
        if (vm.pw === vm.repeatedPw) {
            vm.notIdentical = false;
            User.updatePassword(vm.userKey, {
                password: vm.pw,
                token: vm.token
            }).then(function (data) {
                //will redirect from User service
            }, function (err) {
                //TODO inform user that the attept to update the password faild. toast probably
            });
        } else {
            vm.notIdentical = true;
        }
    }
}

module.exports = updatePasswordCtrl;
