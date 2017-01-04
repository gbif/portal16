'use strict';

angular
    .module('portal')
    .controller('homeCtrl', homeCtrl);

/** @ngInject */
function homeCtrl(CmsSearch) {
    var vm = this;
    vm.latest = new Array(4);//show placeholder loader until the actual news return

    function getLatest() {
        CmsSearch.query({
                limit: 2,
                type: 'news'
            }, function(data){
                vm.latest[0] = data.results[0];
                vm.latest[1] = data.results[1];
            }, function(){
                //TODO handle missing cms news
            });
        CmsSearch.query({
                limit: 2,
                type: 'data_use'
            }, function(data){
                vm.latest[2] = data.results[0];
                vm.latest[3] = data.results[1];
            }, function(){
                //TODO handle missing cms news
            });
        //CmsSearch.query({
        //        limit: 1,
        //        type: 'event'
        //    }, function(data){
        //        vm.latest[3] = data.results[0];
        //    }, function(err){
        //        console.log(err);
        //    });
    }
    getLatest();
}

module.exports = homeCtrl;
