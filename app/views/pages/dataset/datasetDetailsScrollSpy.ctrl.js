'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('scrollSpyCtrl', scrollSpyCtrl);

/** @ngInject */
function scrollSpyCtrl($scope, $document) {
    $scope.toTheTop = function() {
        $document.scrollTopAnimated(0, 750).then(function() {
            console && console.log('Scrolled to the top');
        });
    }
}

module.exports = scrollSpyCtrl;