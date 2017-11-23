'use strict';

angular
    .module('portal')
    .controller('dataRepositoryKeyCtrl', dataRepositoryKeyCtrl);

/** @ngInject */
function dataRepositoryKeyCtrl($stateParams, DataPackage, ResourceSearch) {
    var vm = this;
    vm.key = $stateParams.key;
    vm.citations = ResourceSearch.query({q: '"' + vm.key + '"', limit: 0});

    DataPackage.get({key: vm.key}, function(data){
        vm.upload = data;
    }, function(err){
        console.log(err);
    });

    vm.guessFileName = function(pathName){
        return pathName.split('/').pop();
    };
}

module.exports = dataRepositoryKeyCtrl;
