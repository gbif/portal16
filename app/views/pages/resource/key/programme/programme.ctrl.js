'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('programmeKeyCtrl', programmeKeyCtrl);

/** @ngInject */
function programmeKeyCtrl(ResourceSearch, env, $http, $location, $rootScope) {
    var vm = this;
    vm.key = gb.programmeKey;
    vm.imageCache = env.imageCache;
    vm.state = {
        sortType: 'title'
    };
    var tabs = ['about', 'news', 'events', 'projects'];

    ResourceSearch.query({q: vm.key, contentType: 'project', limit:500}, function(data){
        //filter results since we ask by free text query. the API for some reason do not support querying by programme id. This would be nice to have
        data.results = _.filter(data.results, function(e){
            return _.get(e, 'programme.id') == vm.key;
        });
        data.count = data.results.length;
        vm.projects = data;
        console.log(vm.projects);
    });

    $http.get('/api/resource/key/search', {
            params: {key: vm.key, type: 'news'}
        })
        .then(function (response) {
            vm.news = response;
        })
        .catch(function () {
            //TODO inform user if wuery fails
        });

    $http.get('/api/resource/key/search', {
            params: {key: vm.key, type: 'events'}
        })
        .then(function (response) {
            vm.events = response;
            // vm.updateGrid();
        })
        .catch(function () {
            //TODO inform user if wuery fails
        });

    // var pckry;
    // vm.updateGrid = function(){
    //     $timeout(function () {
    //         var elem = document.querySelector('.grid');
    //         pckry = new Packery( elem, {
    //             // options
    //             itemSelector: '.grid-item',
    //             gutter: 10
    //         });
    //     }, 100);
    //     $timeout(function () {
    //         var elem = document.querySelector('.grid');
    //         pckry = new Packery( elem, {
    //             // options
    //             itemSelector: '.grid-item',
    //             gutter: 10
    //         });
    //     }, 700);
    // };

    vm.goto = function(url){
        window.location.href = url;
    };

    vm.preventBubbling = function(event){
        event.stopPropagation();
        return false;
    };

    function updateTab() {
        vm.hash = tabs.indexOf($location.hash()) > -1 ? $location.hash() : 'about';
        // vm.updateGrid();
    }
    updateTab();

    $rootScope.$on('$locationChangeSuccess', function () {
        updateTab();
    });
}

module.exports = programmeKeyCtrl;
