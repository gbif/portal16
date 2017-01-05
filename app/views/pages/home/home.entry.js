'use strict';

angular
    .module('portal')
    .controller('homeCtrl', homeCtrl);

/** @ngInject */
function homeCtrl(CmsSearch, $http) {
    var vm = this;
    vm.latest = new Array(4);//show placeholder loader until the actual news return

    function getLatest() {
        CmsSearch.query({
                limit: 1,
                type: 'news'
            }, function(data){
                vm.latest[0] = data.results[0];
            }, function(){
                //TODO handle missing cms news
            });
        CmsSearch.query({
                limit: 2,
                type: 'data_use'
            }, function(data){
                vm.latest[1] = data.results[0];
                vm.latest[2] = data.results[1];
            }, function(){
                //TODO handle missing cms data
            });
        $http.get('/api/home/upcomingEvents', {}).then(function(response){
                vm.latest[3] = response.data.results[0];
                console.log(response.data.results[0]);
                //TODO handle missing events
            }, function(err){
                //TODO handle failing queries
            });
    }
    getLatest();
}

module.exports = homeCtrl;
