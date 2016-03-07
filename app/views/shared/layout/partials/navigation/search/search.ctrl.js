'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('searchCtrl', searchCtrl);

/** @ngInject */
function searchCtrl($scope, $state, $translate) {
    $scope.test = 'hej med dig også';
    $scope.gototester = function(){
        $translate.use('da');
        $state.go('testerpage', {}, {reload: true});
    };
}

module.exports = searchCtrl;