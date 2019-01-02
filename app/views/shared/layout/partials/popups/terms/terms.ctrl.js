'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('termsCtrl', termsCtrl);

/** @ngInject */
function termsCtrl($cookies) {
    var vm = this;
    vm.userAcceptance = $cookies.get('userAcceptance') === 'dec2018';
    vm.accept = function() {
        // this will set the expiration to 12 months
        var now = new Date(),
            exp = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        $cookies.put('userAcceptance', 'dec2018', {
            path: '/',
            expires: exp
        });
        vm.userAcceptance = true;
    };
}

module.exports = termsCtrl;
