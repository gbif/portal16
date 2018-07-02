'use strict';


var angular = require('angular'),
    globeCreator = require('../mapWidget/globe');


angular
    .module('portal')
    .directive('globe', globeDirective);

/** @ngInject */
function globeDirective() {
    var directive = {
        restrict: 'E',
        transclude: true,
        // templateUrl: '/templates/components/map/globe/globe.html?v=' + BUILD_VERSION,
        template: '<canvas class="globe"></canvas>',
        scope: {
            latitude: '=',
            longitude: '='
        },
        link: globeLink,
        controller: globe,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function globeLink(scope, element) {// , attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function globe($state, $scope) {
        var vm = this;

        $scope.create = function(element) {
            createGlobe(element);
        };

        function createGlobe(element) {
            var globeCanvas = element[0].querySelector('.globe');
            vm.globe = globeCreator(globeCanvas, {
                land: '#4d5258',
                focus: 'deepskyblue'
            });
            vm.globe.setCenter(vm.latitude, vm.longitude, 6);
        }

        $scope.$watchCollection(function() {
            return vm.filter;
        }, function() {
            // map.update({filters: getQuery()});
        });
    }
}

module.exports = globeDirective;
