'use strict';

var angular = require('angular');

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
    var tabs = ['about', 'news', 'datasets'];

    vm.projects = ResourceSearch.query({q: vm.key, contentType: 'project', limit:500}, function () {
        vm.failedRequest = false;
    }, function () {
        vm.failedRequest = true;
    });

    $http.get('/api/resource/key/search', {
            params: {key: vm.key, type: 'news'}
        })
        .then(function (response) {
            vm.news = response;
        })
        .catch(function (err) {
            console.log(err);
        });

    $http.get('/api/resource/key/search', {
            params: {key: vm.key, type: 'events'}
        })
        .then(function (response) {
            vm.events = response;
        })
        .catch(function (err) {
            console.log(err);
        });

    vm.goto = function(url){
        window.location.href = url;
    };

    vm.preventBubbling = function(event){
        event.stopPropagation();
        return false;
    };

    function updateTab() {
        vm.hash = tabs.indexOf($location.hash()) > -1 ? $location.hash() : 'about';
    }
    updateTab();

    $rootScope.$on('$locationChangeSuccess', function () {
        updateTab();
    });
}

module.exports = programmeKeyCtrl;
