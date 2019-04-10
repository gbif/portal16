'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('projectKeyCtrl', projectKeyCtrl);

/** @ngInject */
function projectKeyCtrl(DatasetSearch, $q, env, $http, $location, $rootScope, BUILD_VERSION) {
    var vm = this;
    vm.projectId = gb.projectId;
    vm.key = gb.projectKey;
    vm.imageCache = env.imageCache;
    vm.tileApi = env.tileApi;
    vm.BUILD_VERSION = BUILD_VERSION;
    var tabs = ['about', 'news', 'datasets'];

    if (vm.projectId) {
        vm.datasets = DatasetSearch.query({projectId: vm.projectId, limit: 500}, function() {
            vm.failedRequest = false;
        }, function() {
            vm.failedRequest = true;
        });
    }

    vm.news = $http.get('/api/resource/key/search', {
        params: {key: vm.key, type: 'news'}
    });

    vm.events = $http.get('/api/resource/key/search', {
        params: {key: vm.key, type: 'events'}
    });

    $q.all([vm.news, vm.events]).then(function(values) {
        vm.newsEvents = {};
        vm.newsEvents.results = values[0].data.results.concat(values[1].data.results);
        vm.newsEvents.images = _.assign(values[0].data.images, values[1].data.images);
        vm.newsEvents.results = _.orderBy(vm.newsEvents.results, '_date', 'desc');
    });

    function updateTab() {
        vm.hash = tabs.indexOf($location.hash()) > -1 ? $location.hash() : 'about';
    }
    updateTab();

    $rootScope.$on('$locationChangeSuccess', function() {
        updateTab();
    });
}

module.exports = projectKeyCtrl;

