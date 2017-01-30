'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('theGbifNetworkCtrl', theGbifNetworkCtrl);

/** @ngInject */
function theGbifNetworkCtrl(DirectoryParticipants, DirectoryParticipantsCount, PublisherCount, LiteratureCount, $scope, $filter, $stateParams, $location, ParticipantsDigest, DirectoryNsgContacts) {
    var vm = this;

    vm.validRegions = ['GLOBAL', 'AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'NORTH_AMERICA', 'OCEANIA'];

    vm.currentRegion = $location.path().split('/')[2];
    if (vm.currentRegion) {
        vm.currentRegion = vm.currentRegion.toUpperCase().replace('-', '_');
    }
    else {
        vm.currentRegion = 'GLOBAL';
    }

    vm.membershipType = 'active';
    vm.showChart = false;
    vm.tableLoaded = false;

    $scope.$watch($scope.showChart, function(){
        vm.showchart = $scope.showChart;
    });

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

    // list non-country participants
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
                if (response.publisher) vm.count.publisher = $filter('localNumber')(response.publisher, gb.locale);
                vm.updatedCounts += 1;
            }, function(error){
                return error;
            });
        LiteratureCount.get({'gbifRegion': region}).$promise
            .then(function(response){
                literatureCounts.forEach(function(count){
                    if(response[count]) vm.count[count] = $filter('localNumber')(response[count], gb.locale);
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
        loadParticipantsDigest(vm.currentRegion);
        loadRegionalReps(vm.currentRegion);

        var regionLower = region.toLowerCase().replace('_', '-');
        $location.path('/the-gbif-network/' + regionLower);
    };

    // For participant table.
    loadParticipantsDigest(vm.currentRegion);
    function loadParticipantsDigest(region) {
        vm.tableLoaded = false;
        ParticipantsDigest.get({'gbifRegion': region}).$promise
            .then(function(response){
                // duplicate some counts for sorting.
                response.forEach(function(r){
                    ['occurrenceFromCount', 'datasetFromCount'].forEach(function(c){
                        if (r.counts.hasOwnProperty(c)) {
                            r[c + 'Sort'] = r.counts[c];
                        }
                    });
                    if (r.hasOwnProperty('endorsedPublishers')) {
                        r.endorsedPublishersSort = r.endorsedPublishers;
                    }
                });
                vm.activeParticipantsDigest = response;
                vm.tableLoaded = true;
            }, function(error) {
                return error;
            });
    }

    // For regional representative.
    loadRegionalReps(vm.currentRegion);
    function loadRegionalReps(region) {
        vm.repTableLoaded = false;
        DirectoryNsgContacts.get().$promise
            .then(function(contacts) {
                var reps = contacts.filter(function(contact){
                    var picked = false;
                    contact.roles.forEach(function(role){
                        if (region === 'GLOBAL') {
                            picked = role.role.indexOf('CHAIR') !== -1;
                        }
                        else {
                            picked = role.role.indexOf(region) !== -1;
                        }
                    });
                    return picked;
                });
                vm.reps = reps;
                vm.repTableLoaded = true;
            }, function(error){
                return error;
            });
    }
    vm.toggleStatus = {};
    vm.toggleDetail = function (personId) {
        // true means show
        if (vm.toggleStatus[personId] && vm.toggleStatus[personId] == 'contact--show') {
            vm.toggleStatus[personId] = false;
        }
        else {
            vm.toggleStatus[personId] = 'contact--show';
        }
    };

    // Nav fix.
    var EventUtil = {
        addHandler: function (element, type, handler) {
            if (element.addEventListener) {
                element.addEventListener(type, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + type, handler);
            } else {
                element['on' + type] = handler;
            }
        }
    };

    var topClass = 'region-selector-fixed',
        paddingClass = 'selected-fixed-padding',
        regionNav = document.getElementById('region-nav'),
        mapStrip = document.getElementById('map-strip'),
        offsetTop = regionNav.getBoundingClientRect().top;

    EventUtil.addHandler(window, 'scroll', function () {
        if (document.compatMode == 'CSS1Compat') {

            if (document.body.scrollTop >= offsetTop - 50) {
                regionNav.classList.add(topClass);
                mapStrip.classList.add(paddingClass);
            } else {
                regionNav.classList.remove(topClass);
                mapStrip.classList.remove(paddingClass);
            }

        }
    });

}

module.exports = theGbifNetworkCtrl;
