'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('directoryPerson', directoryPersonDirective);

/** @ngInject */
function directoryPersonDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        templateUrl: '/templates/components/directoryPerson/directoryPerson.html?v=' + BUILD_VERSION,
        scope: {
            personId: '='
        },
        replace: true,
        controller: directoryPerson,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function directoryPerson(DirectoryPerson) {
        var vm = this;
        console.log('directoryPerson');
        console.log(vm.personId);
        vm.person = DirectoryPerson.get({id: vm.personId});
    }
}

module.exports = directoryPersonDirective;

