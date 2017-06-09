'use strict';

require('../../shared/layout/html/angular/topoJson.resource');

var angular = require('angular'),
    moment = require('moment'),
    topojson = require('topojson'),
    ol = require('openlayers'),
    projections = require('../../components/map/mapWidget/projections');

angular
    .module('portal')
    .controller('theGbifNetworkCtrl', theGbifNetworkCtrl);

/** @ngInject */
function theGbifNetworkCtrl(DirectoryParticipants, DirectoryParticipantsCount, PublisherCount, LiteratureCount, $scope,$stateParams, $filter,  $location, ParticipantsDigest, DirectoryNsgContacts, WorldTopoJson, leafletData, ParticipantHeads, PublisherEndorsedBy, CountryDataDigest, $q, $translate, $timeout) {
    var vm = this;

    vm.validRegions = ['GLOBAL', 'AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'NORTH_AMERICA', 'OCEANIA'];
    var regionCenters = {
        'GLOBAL': {zoom: 2, lat: 0, lng: 0},
        'ASIA': {zoom: 4, lat: 11, lng: 114},
        'AFRICA': {zoom: 3, lat: 6.6, lng: 16.4},
        'EUROPE': {zoom: 4, lat: 56, lng: 11},
        'LATIN_AMERICA': {zoom: 3, lat: -15, lng: -86},
        'NORTH_AMERICA': {zoom: 3, lat: 51, lng: -107},
        'OCEANIA': {zoom: 4, lat: -30, lng: 138}
    };

// ###############################################

    var mapElement = document.getElementById('theNetworkMap');
    var currentProjection = projections.EPSG_4326;
    var map = new ol.Map({
        target: mapElement,
        layers: [
            currentProjection.getBaseLayer({style: 'gbif-light'})
        ]
    });

    map.setView(currentProjection.getView(0, 0, 1));
    if (currentProjection.fitExtent) {
        map.getView().fit(currentProjection.fitExtent);
    }
    var styles = {
        voting_participant: new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#4E9F37'
            }),
            stroke: new ol.style.Stroke({
                color: '#FFFFFF',
                width: 1
            })
        }),
        associate_country_participant: new ol.style.Style({
            fill: new ol.style.Fill({
                color: '#58BAE9'
            }),
            stroke: new ol.style.Stroke({
                color: '#FFFFFF',
                width: 1
            })
        }),

    }
    var vector = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/api/topojson/world',
            format: new ol.format.TopoJSON(),
            overlaps: false
        }),
        style: function(feature) {
            return styles[feature.O.membershipType];

        }
    });
   map.addLayer(vector);

    var displayFeatureInfo = function(pixel) {

        var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
            return feature;
        });

        if (feature) {
            vm.updateParticipantDetails(feature.O);
          map.getView().fit(ol.proj.transformExtent(feature.getGeometry().getExtent(), 'EPSG:4326', currentProjection.srs));
        } else {
            vm.showParticipantDetails = false;
        }



    };



    map.on('click', function(evt) {
        displayFeatureInfo(evt.pixel);
    });

    vm.mapIsLoaded = true;

    var zoomToRegion = function(region){
        var view =  new ol.View({

            center: [regionCenters[region].lng, regionCenters[region].lat],
            zoom: regionCenters[region].zoom,
            projection: 'EPSG:4326'
        })
        map.setView(view);
    }

//###########################################

    vm.membershipType = 'active';
    vm.showChart = false;
    vm.tableLoaded = false;

    $scope.$watch($scope.showChart, function(){
        vm.showchart = $scope.showChart;
    });



    vm.updateParticipantDetails = function (props) {
    delete vm.heads;
    delete vm.digest;
    delete vm.endorsedPublisher;
        vm.showParticipantDetails = true;
        var tasks = {};
        vm.digestLoaded = false;
        vm.currentParticipantProps = props;
        if (props && props.id) {
            tasks.heads = ParticipantHeads.get({participantId: props.id}).$promise;
            tasks.endorsement = PublisherEndorsedBy.get({participantId: props.id}).$promise;
            var mStart = vm.currentParticipantProps.membershipStart;
            vm.currentParticipantProps.membershipStart = moment(mStart, 'MMMM YYYY').format('YYYY');
        }
        if (props && props.ISO2) {
            tasks.digest = CountryDataDigest.get({iso2: props.ISO2}).$promise;
        }

        $q.all(tasks).then(function(results){
            if (results.hasOwnProperty('heads')) {

                vm.heads = results.heads;
            }
            if (results.hasOwnProperty('endorsement') && results.endorsement.hasOwnProperty('count')) {
                vm.endorsedPublisher = results.endorsement.count;
            }
            if (results.hasOwnProperty('digest') && results.digest.length > 0) {
                vm.digest = results.digest[0];
            }
            vm.digestLoaded = true;
        });


    };






    vm.count = {};
    vm.participantTypes = [
        'voting_participant',
        'associate_country_participant',
        'other_associate_participant'
    ];
    //var literatureCounts = [
    //    'literature',
    //    'literatureAuthors',
    //    'literatureAuthorFromCountries'
    //];

    vm.query = $stateParams;
    vm.updatedCounts = 2;

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
        vm.showParticipantDetails = false;
        vm.updatedCounts = 0;
        vm.currentRegion = region;
        vm.totalParticipantCount = 0;

        var query = (region !== 'OTHER') ? {'gbifRegion': region} : {'membershipType': 'other_associate_participant'};

        DirectoryParticipantsCount.get(query).$promise
            .then(function (response) {
                vm.participantTypes.forEach(function(pType){
                    if (response[pType]) {
                    vm.count[pType] = response[pType];
                        vm.totalParticipantCount += parseInt(response[pType]);
                    };
                });
                vm.updatedCounts += 1;
            }, function (error) {
                return error;
            });
        PublisherCount.get(query).$promise
            .then(function(response){
                if (response.publisher) vm.count.publisher = $filter('localNumber')(response.publisher, gb.locale);
                vm.updatedCounts += 1;
            }, function(error){
                return error;
            });
        //LiteratureCount.get({'gbifRegion': region}).$promise
        //    .then(function(response){
        //        literatureCounts.forEach(function(count){
        //            if(response[count]) vm.count[count] = $filter('localNumber')(response[count], gb.locale);
        //        });
        //        vm.updatedCounts += 1;
        //    }, function(error){
        //        return error;
        //    });
        // DirectoryParticipants.get({'gbifRegion': region, 'membershipType': 'other_associate_participant'}).$promise
        //     .then(function(response){
        //         vm.nonCountryParticipants = response;
        //     }, function (error){
        //         return error;
        //     });
        loadParticipantsDigest(vm.currentRegion);
        loadRegionalReps(vm.currentRegion);

        if (region !== 'OTHER'){

            zoomToRegion(region);

        }

        var regionLower = region.toLowerCase().replace('_', '-');
        $location.path('/the-gbif-network/' + regionLower);
    };

    vm.currentRegion = $location.path().split('/')[2];
    if (vm.currentRegion) {
        vm.currentRegion = vm.currentRegion.toUpperCase().replace('-', '_');
        vm.selectRegion(vm.currentRegion);
    }
    else {
        vm.currentRegion = 'GLOBAL';
        vm.selectRegion(vm.currentRegion);
    }

    // For participant table.
    loadParticipantsDigest(vm.currentRegion);
    function loadParticipantsDigest(region) {
        vm.tableLoaded = false;
        delete vm.activeParticipantsDigest;

        var query = (region !== 'OTHER') ? {'gbifRegion': region} : { 'membershipType': 'other_associate_participant'};

        ParticipantsDigest.get(query).$promise
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
        delete vm.reps;
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


}

module.exports = theGbifNetworkCtrl;
