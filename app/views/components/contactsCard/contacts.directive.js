'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('contacts', contactsDirective);

/** @ngInject */
function contactsDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/components/contactsCard/contacts.html?v=' + BUILD_VERSION,
        scope: {
            contactList: '='
        },
        controller: contactsCtrl,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function contactsCtrl() {
        var vm = this;
        vm.visible = {};
    }
}

module.exports = contactsDirective;

