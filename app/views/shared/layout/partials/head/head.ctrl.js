'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('headCtrl', headCtrl);

/** @ngInject */
function headCtrl(Page) {
    var vm = this;
    vm.Page = Page;

    vm.getTitle = function(defaultTitle) {
        return Page.title() || defaultTitle || 'GBIF';
    };
}

module.exports = headCtrl;
