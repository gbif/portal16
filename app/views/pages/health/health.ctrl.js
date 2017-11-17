'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('healthCtrl', healthCtrl);

/** @ngInject */
function healthCtrl($http) {
    var vm = this;

    vm.status;
    vm.update = function(){
        $http.get('/api/health')
            .then(function(response){
                vm.status = response.data;
            })
            .catch(function(err){
                console.log(err);
            });
    };
    vm.update();
}


module.exports = healthCtrl;
