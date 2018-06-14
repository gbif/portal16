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
    vm.locale = gb.locale;
    vm.state = {
        sortType: 'title'
    };
    var tabs = ['about', 'news', 'events', 'projects'];

    ResourceSearch.query({q: vm.key, contentType: 'project', limit: 500}, function(data) {
        // filter results since we ask by free text query. the API for some reason do not support querying by programme id. This would be nice to have
        data.results = _.filter(data.results, function(e) {
            return _.get(e, 'programme.id') == vm.key;
        });
        _.forEach(data.results, function(e) {
e.call = _.get(e.call, 'title');
});
        data.count = data.results.length;
        vm.projects = data;
    });

    ResourceSearch.query({contentType: 'news', programmeTag: vm.key, limit: 500}, function(data) {
        vm.news = data;
    }, function(err) {
        // TODO inform user if query fails
    });

    // events are still not decorated with programmeTag. Fede intend to add that. when so, this is the cleaner way to get the data. And perhaps the other endpoint can be removed completely.
    // ResourceSearch.query({contentType: 'event', programmeTag: vm.key, _showPastEvents: true, limit:500}, function(data){
    //    vm.events = data;
    // }, function(err){
    //    //TODO inform user if query fails
    // });

    $http.get('/api/resource/key/search', {
            params: {key: vm.key, type: 'events'}
        })
        .then(function(response) {
            vm.events = response;
            // vm.updateGrid();
        })
        .catch(function() {
            // TODO inform user if wuery fails
        });

    vm.goto = function(url) {
        window.location.href = url;
    };

    vm.preventBubbling = function(event) {
        event.stopPropagation();
        return false;
    };

    function updateTab() {
        vm.hash = tabs.indexOf($location.hash()) > -1 ? $location.hash() : 'about';
        // vm.updateGrid();
    }
    updateTab();

    $rootScope.$on('$locationChangeSuccess', function() {
        updateTab();
    });
}

module.exports = programmeKeyCtrl;
