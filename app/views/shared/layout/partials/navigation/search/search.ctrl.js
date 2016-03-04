'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('searchCtrl', searchCtrl);

/** @ngInject */
function searchCtrl($scope, $state, $translate) {
    var vm = this;
    $scope.test = 'hej med dig også';
    $scope.gototester = function(){
        console.log('testerpage');
        $translate.use('da');
        $state.go('testerpage', {}, {reload: true});
    };
}

module.exports = searchCtrl;