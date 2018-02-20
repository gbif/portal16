'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('healthCtrl', healthCtrl);

/** @ngInject */
function healthCtrl($http, User, env) {
    var vm = this;
    vm.gitCommit = env.gitCommit;
    vm.status = undefined;
    vm.loaded = false;
    var hash = '_empty';

    function update() {
        vm.healthPromise = $http.get('/api/health?hash=' + hash)
            .then(function(response) {
                if (response.status == 200) {
                    hash = response.data.hash;
                    vm.loaded = true;
                    vm.status = response.data;
                }
            })
            .catch(function() {
                vm.failed = true;
            });
    }
    update();

    vm.isSecretariatUser = false;
    var activeUser = User.loadActiveUser();
    activeUser.then(function(response) {
        // there is no security in this, it simply shows the error messages, but this isn't interesting to most users
        vm.isSecretariatUser = _.endsWith(_.get(response, 'data.email', ''), '@gbif.org');
    });
}


module.exports = healthCtrl;
