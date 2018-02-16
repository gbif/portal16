'use strict';

let angular = require('angular');

angular
    .module('portal')
    .controller('headCtrl', headCtrl);

/** @ngInject */
function headCtrl(Page) {
    let vm = this;
    vm.Page = Page;

    vm.getTitle = function(defaultTitle) {
        return Page.title() || defaultTitle || 'GBIF';
    };
}

module.exports = headCtrl;
