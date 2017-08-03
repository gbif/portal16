'use strict';

var angular = require('angular'),
    _ = require('lodash');

require('../../../../components/directoryPerson/directoryPerson.directive');
require('../../../../components/modal/modal.directive');

angular
    .module('portal')
    .controller('contactDirectoryCtrl', contactDirectoryCtrl);

/** @ngInject */
function contactDirectoryCtrl(Page, $state, $stateParams, $http, $uibModal) {
    var vm = this;
    Page.setTitle('Directory');
    vm.$state = $state;

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
        // vm.modalInstance = $uibModal.open({
        //     animation: true,
        //     ariaLabelledBy: 'modal-title',
        //     ariaDescribedBy: 'modal-body',
        //     templateUrl: 'modalDirectoryPerson.html',
        //     controller: 'ModalDirectoryPersonInstanceCtrl',
        //     controllerAs: 'vm',
        //     resolve: {
        //         personId: function () {
        //             return personId;
        //         }
        //     }
        // });
        // //This will run when modal dismisses itself when clicked outside or
        // //when you explicitly dismiss the modal using .dismiss function.
        // vm.modalInstance.result.catch(function(){
        //     //Do stuff with respect to dismissal
        //     $state.go('.', {}, {inherit: false, notify: false, reload: false});
        // });
    };

    if ($stateParams.personId) {
        vm.showPerson($stateParams.personId);
    }

    vm.hideModal = function(){
        vm.showModal = false;
        $state.go('.', {}, {inherit: false, notify: false, reload: false});
    }
}

module.exports = contactDirectoryCtrl;

/** @ngInject */
angular.module('portal').controller('ModalDirectoryPersonInstanceCtrl', function ($uibModalInstance, personId) {
    var vm = this;
    vm.personId = personId;
    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
