'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('grscicollperson', grscicollPersonDirective);

/** @ngInject */
function grscicollPersonDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/components/grscicollPerson/grscicollPerson.html?v=' + BUILD_VERSION,
        scope: {
          contactInfo: '='
        },
        controller: grscicollPersonCtrl,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function grscicollPersonCtrl() {
        var vm = this;
        vm.contact = vm.contactInfo;

        vm.getAsArray = function(value) {
            return angular.isArray(value) ? value : [value];
        };

        vm.getRoles = function(roles) {
            var r = vm.getAsArray(roles);
            return _.map(r, function(e) {
                return _.isString(e) ? e : e.role;
            });
        };

        vm.isOrcid = function(userId) {
            return userId.indexOf('orcid.org') != -1;
        };
    }
}

module.exports = grscicollPersonDirective;

