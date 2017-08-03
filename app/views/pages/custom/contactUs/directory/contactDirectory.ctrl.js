'use strict';

var angular = require('angular'),
    _ = require('lodash');

require('../../../../components/directoryPerson/directoryPerson.directive');
require('../../../../components/modal/modal.directive');

angular
    .module('portal')
    .controller('contactDirectoryCtrl', contactDirectoryCtrl);

/** @ngInject */
function contactDirectoryCtrl(Page, $state, $stateParams, $http) {
    var vm = this;
    Page.setTitle('Directory');
    vm.$state = $state;
    vm.state = {};

    vm.sections = {
        executiveCommittee: {
            title: 'executiveCommittee key',
            description: 'executiveCommittee description key',
            columns: [
                {name: 'name', type:'TEXT'},
                {name: 'role', type:'ENUM', 'path': 'role.'}
            ],
            personId: 'personId',
            people: []
        }
    };
    $http.get('/api/directory/committee/executive_committee').then(function (response) {
        vm.executiveCommittee = response.data;
    });
    $http.get('/api/directory/committee/science_committee').then(function (response) {
        vm.scienceCommittee = response.data;
    });
    $http.get('/api/directory/committee/budget_committee').then(function (response) {
        vm.budgetCommittee = response.data;
    });
    $http.get('/api/directory/committee/nodes_committee').then(function (response) {
        vm.nodesCommittee = response.data;
    });
    $http.get('/api/directory/committee/nodes_steering_group').then(function (response) {
        vm.nsg = response.data;
    });
    $http.get('/api/directory/secretariat').then(function (response) {
        vm.secretariat = response.data;
    });
    $http.get('/api/directory/participantPeople', {
        params: {
            type: 'COUNTRY',
            participation_status: 'VOTING',
            limit: 1000
        }
    }).then(function (response) {
        vm.voting = response.data;
    });

    $http.get('/api/directory/participantPeople', {
        params: {
            type: 'COUNTRY',
            participation_status: 'ASSOCIATE',
            limit: 1000
        }
    }).then(function (response) {
        vm.associateCountries = response.data;
    });

    $http.get('/api/directory/participantPeople', {
        params: {
            type: 'OTHER',
            participation_status: 'ASSOCIATE',
            limit: 1000
        }
    }).then(function (response) {
        vm.associateParticipants = response.data;
    });

    vm.showPerson = function(personId) {
        $state.go('.', {personId: personId}, {inherit: false, notify: false, reload: false});
        vm.personId = personId;
        vm.showModal = true;
    };

    if ($stateParams.personId) {
        vm.showPerson($stateParams.personId);
    }

    vm.hideModal = function(){
        vm.showModal = false;
        $state.go('.', {}, {inherit: false, notify: false, reload: false});
    }

    vm.changeSortOrder = function(col) {
        if (vm.state.sortType == col) {
            if (vm.state.sortReverse) {
                vm.state.sortType = undefined;
                vm.state.sortReverse = undefined;
            } else {
                vm.state.sortReverse = true;
            }
        } else {
            vm.state.sortType = col;
            vm.state.sortReverse = false;
        }
    }
}

module.exports = contactDirectoryCtrl;