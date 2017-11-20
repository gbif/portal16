'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('healthCtrl', healthCtrl);

/** @ngInject */
function healthCtrl($http, $scope, HEALTH, User) {
    var vm = this;

    vm.status;
    vm.loaded = false;
    vm.update = function(){
        vm.healthPromise = $http.get('/api/health')
            .then(function(response){
                vm.loaded = true;
                vm.status = response.data;
            })
            .catch(function(err){
                console.log(err);
                vm.failed = true;
            });
    };
    vm.update();

    $scope.$on(HEALTH.CHANGED, function (event, status) {
        vm.status = status;
        console.log(status);
        vm.loaded = true;
        vm.failed = false;
    });

    vm.isSecretariatUser = false;
    var activeUser = User.loadActiveUser();
    activeUser.then(function (response) {
        //there is no security in this, it simply shows the error messages, but this isn't interesting to most users
        vm.isSecretariatUser = _.endsWith(_.get(response, 'data.email', ''), '@gbif.org');
    });
}


module.exports = healthCtrl;
