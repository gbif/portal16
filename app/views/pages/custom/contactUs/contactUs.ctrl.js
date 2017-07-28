'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('contactUsCtrl', contactUsCtrl);

/** @ngInject */
function contactUsCtrl(Page, $state) {
    var vm = this;
    Page.setTitle('Contact us');
    vm.$state = $state;
}

module.exports = contactUsCtrl;

