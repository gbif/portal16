'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('contactUsCtrl', contactUsCtrl);

/** @ngInject */
function contactUsCtrl(Page, $state, $translate) {
    var vm = this;
    $translate('contactUs.title').then(function(title) {
        Page.setTitle(title);
    });

    Page.drawer(false);
    vm.$state = $state;
}

module.exports = contactUsCtrl;

