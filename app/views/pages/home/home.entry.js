'use strict';

angular
    .module('portal')
    .controller('homeCtrl', homeCtrl);

/** @ngInject */
function homeCtrl(CmsSearch, $http) {
    var vm = this;
    vm.latest = new Array(4);//show placeholder loader until the actual news return
    if (window.location.search.indexOf('underDevelopment') >= 0 ) {
        vm.underDevelopment = true;
    }
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
                //TODO handle missing events
            }, function(){
                //TODO handle failing queries
            });
        //$http.get('/api/home/localrss?mockip=89.114.136.105', {}).then(function(response){
        //    vm.latest[2] = response.data;
        //    vm.latest[2].title = vm.latest[2].title;
        //    vm.latest[2].created = vm.latest[2].pubDate;
        //    vm.latest[2].targetUrl = vm.latest[2].link;
        //    //TODO handle missing events
        //}, function(){
        //    //TODO handle failing queries
        //});
    }
    getLatest();


    // var shuffle = function(a) {
    //     var j, x, i;
    //     for (i = a.length; i; i--) {
    //         j = Math.floor(Math.random() * i);
    //         x = a[i - 1];
    //         a[i - 1] = a[j];
    //         a[j] = x;
    //     }
    //     return a;
    // }

    // vm.images = [];
    // var search = function (query, a) {
    //     query.mediaType = 'stillImage';
    //     query.limit=10;
    //     OccurrenceSearch.query(query, function (data) {
    //         vm.count = data.count;
    //         vm.endOfRecords = data.endOfRecords;
    //         data.results.forEach(function (e) {
    //             //select first image
    //             e._images = [];
    //             for (var i = 0; i < e.media.length; i++) {
    //                 if (e.media[i].type == 'StillImage') {
    //                     e._images.push(e.media[i]);
    //                 }
    //             }
    //         });

    //         vm.images = shuffle(vm.images.concat(data.results));
    //     }, function () {
    //         //TODO handle request error
    //     });
    // };
    // search({
    //     dataset_key: 'e635240a-3cb1-4d26-ab87-57d8c7afdfdb',
    //     basis_of_record: 'PRESERVED_SPECIMEN'
    // });
    // search({
    //     dataset_key: 'cd6e21c8-9e8a-493a-8a76-fbf7862069e5',
    //     basis_of_record: 'PRESERVED_SPECIMEN'
    // });
    // search({
    //     dataset_key: '3c9e2297-bf20-4827-928e-7c7eefd9432c',
    //     basis_of_record: 'PRESERVED_SPECIMEN'
    // });

    // search({
    //     dataset_key: '4bfac3ea-8763-4f4b-a71a-76a6f5f243d3',
    //     basis_of_record: 'PRESERVED_SPECIMEN'
    // });

    // search({
    //     dataset_key: '50c9509d-22c7-4a22-a47d-8c48425ef4a7',
    //     q: 'Ryan Brooks'
    // });

}

module.exports = homeCtrl;
