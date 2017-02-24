'use strict';

angular
    .module('portal')
    .controller('homeCtrl', homeCtrl);

/** @ngInject */
function homeCtrl($http) {
    var vm = this;
    vm.country;
    if (window.location.search.indexOf('underDevelopment') >= 0 ) {
        vm.underDevelopment = true;
    }
    function getLatest() {
        vm.country = 'DK';
        $http.get('/api/home/rss/' + vm.country, {}).then(function(response){
            if (response.status == 200) {
                vm.rssFeed = response.data;
                vm.hasFeed = true;
            }
        }, function(){
            //TODO ignore failures as this is optional anyhow
        });
    }
    //getLatest();
}

module.exports = homeCtrl;
