'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('grscicollCtrl', grscicollCtrl);

/** @ngInject */
function grscicollCtrl(Page, $state) {
    var vm = this;
    Page.setTitle('grscicoll');
    Page.drawer(false);
    vm.$state = $state;
}

module.exports = grscicollCtrl;

