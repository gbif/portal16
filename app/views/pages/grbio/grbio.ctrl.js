'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('grbioCtrl', grbioCtrl);

/** @ngInject */
function grbioCtrl(Page, $state) {
    var vm = this;
    Page.setTitle('GRBIO');
    Page.drawer(false);
    vm.$state = $state;
}

module.exports = grbioCtrl;

