'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('theGbifNetworkCtrl', theGbifNetworkCtrl);

/** @ngInject */
function theGbifNetworkCtrl(DirectoryParticipants, DirectoryParticipantsCount, PublisherCount, LiteratureCount, LiteratureYearly, $stateParams, $location) {
    var vm = this;

    vm.currentRegion = $location.path().split('/')[2];
    if (vm.currentRegion) {
        vm.currentRegion = vm.currentRegion.toUpperCase().replace('-', '_');
    }
    else {
        vm.currentRegion = 'GLOBAL';
    }

    vm.count = {};
    vm.participantTypes = [
        'voting_participant',
        'associate_country_participant',
        'other_associate_participant'
    ];
    var literatureCounts = [
        'literature',
        'literatureAuthors',
        'literatureAuthorFromCountries'
    ];

    vm.query = $stateParams;
    vm.updatedCounts = 3;

    vm.nonCountryParticipants = [];
    if (vm.nonCountryParticipants.length == 0) {
        DirectoryParticipants.get({'gbifRegion': vm.currentRegion, 'membershipType': 'other_associate_participant'}).$promise
            .then(function(response){
                vm.nonCountryParticipants = response;
            }, function (error){
                return error;
            });
    }

    vm.selectRegion = function(region) {
        vm.updatedCounts = 0;
        vm.currentRegion = region;
        DirectoryParticipantsCount.get({'gbifRegion': region}).$promise
            .then(function (response) {
                vm.participantTypes.forEach(function(pType){
                    if (response[pType]) vm.count[pType] = response[pType];
                });
                vm.updatedCounts += 1;
            }, function (error) {
                return error;
            });
        PublisherCount.get({'gbifRegion': region}).$promise
            .then(function(response){
                if (response.publisher) vm.count.publisher = response.publisher;
                vm.updatedCounts += 1;
            }, function(error){
                return error;
            });
        LiteratureCount.get({'gbifRegion': region}).$promise
            .then(function(response){
                literatureCounts.forEach(function(count){
                    if(response[count]) vm.count[count] = response[count];
                });
                vm.updatedCounts += 1;
            }, function(error){
                return error;
            });
        DirectoryParticipants.get({'gbifRegion': region, 'membershipType': 'other_associate_participant'}).$promise
            .then(function(response){
                vm.nonCountryParticipants = response;
            }, function (error){
                return error;
            });

        var regionLower = region.toLowerCase().replace('_', '-');
        $location.path('/the-gbif-network/' + regionLower);
    };
}

module.exports = theGbifNetworkCtrl;