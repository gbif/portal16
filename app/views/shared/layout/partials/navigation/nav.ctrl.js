'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('navCtrl', navCtrl);

/** @ngInject */
function navCtrl($http, $location, $rootScope, NAV_EVENTS) {
    var vm = this;

    vm.toggleNotifications = function () {
        $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {state: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleNotifications, {toggle: true});
    };

    vm.toggleFeedback = function () {
        $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {state: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true});
        $rootScope.$broadcast(NAV_EVENTS.toggleNotifications, {toggle: false});
    };

    vm.toggleSearch = function () {
        $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {toggle: true});
        $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {state: false});
        $rootScope.$broadcast(NAV_EVENTS.toggleNotifications, {toggle: false});
    };

    vm.getIssues = function () {
        $http.get('/api/feedback/issues?item=' + encodeURIComponent($location.path()), {})
            .then(function (response) {
                vm.issuesCount = response.data.total_count;
            }, function (err) {
                vm.issuesCount = undefined;
                //TODO mark as failure or simply hide
            });
    };
    vm.getIssues();

    var isOn = false;
    var xmasId = window.setInterval(myCallback, 2000);

    var s = '<link rel="stylesheet" type="text/css" href="/css/base/shared/style/deleteme.css">'; // HTML string
    var xmasDiv;
    xmasDiv = document.createElement('div');
    document.body.appendChild(xmasDiv);
    function myCallback() {
        $http.get('/api/speciespopulation/ison?cachgebuste=' + new Date(), {}).then(function(response){//TODO christmas delete
            if (!vm.isOn && response.data.on) {
                vm.isOn = true;
                xmasDiv.innerHTML = s;
            } else if (!response.data.on){
                vm.isOn = false;
                xmasDiv.innerHTML = '';
            }
        }, function(err){
            
        });
    }
}

module.exports = navCtrl;
