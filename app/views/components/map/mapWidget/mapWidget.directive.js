'use strict';

var angular = require('angular'),
    mapController = require('./map'),
    //globeCreator = require('./globe'),
    _ = require('lodash');

//require('./gbTileLayer');


angular
    .module('portal')
    .directive('mapWidget', mapWidgetDirective);

/** @ngInject */
function mapWidgetDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'E',
        transclude: true,
        templateUrl: '/templates/components/map/mapWidget/mapWidget.html?v=' + BUILD_VERSION,
        scope: {
            datasetKey: '='
        },
        link: mapLink,
        controller: mapWidget,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function mapLink(scope, element) {//, attrs, ctrl
        scope.create(element);
    }

    /** @ngInject */
    function mapWidget($scope) {
        var vm = this;
        var map;

        $scope.create = function (element) {
            map = mapController.createMap(element);
        };

        vm.restyle = function(){
            map.restyle();
        };

        vm.projectionChange = function(){
            map.projectionChange();
        }
    }
}


module.exports = mapWidgetDirective;
