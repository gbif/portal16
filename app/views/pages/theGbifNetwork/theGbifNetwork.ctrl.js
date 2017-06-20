'use strict';

require('./theGbifNetworkMap.service');

var angular = require('angular'),
    moment = require('moment'),
    topojson = require('topojson'),
    ol = require('openlayers');

angular
    .module('portal')
    .controller('theGbifNetworkCtrl', theGbifNetworkCtrl)


/** @ngInject */
function theGbifNetworkCtrl( DirectoryParticipants, DirectoryParticipantsCount, PublisherCount,  $scope, $state, $stateParams, $filter, ParticipantsDigest, DirectoryNsgContacts, ParticipantHeads, PublisherEndorsedBy, CountryDataDigest, $q, BUILD_VERSION, GBIFNetworkMapService) {
    var vm = this;
    vm.BUILD_VERSION = BUILD_VERSION;
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
    var maxZoom = 7;
    var mapElement = document.getElementById('theNetworkMap');
    var currentProjection = GBIFNetworkMapService.get4326();
    var map = new ol.Map({
        target: mapElement,
        layers: [
            currentProjection.getBaseLayer({style: 'gbif-light'})
        ]
    });

    map.setView(currentProjection.getView(0, 0, 1, 1, maxZoom));
    if (currentProjection.fitExtent) {
        map.getView().fit(currentProjection.fitExtent);
    }


    var colors = {voting_participant: '#4E9F37', associate_country_participant: '#58BAE9'}

    var currentlySelectedFeature;

    var vector = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/api/topojson/world/participants',
            format: new ol.format.TopoJSON(),
            overlaps: false
        }),
        style: function(feature) {

            var stroke = (currentlySelectedFeature === feature) ? '#000000': '#FFFFFF';
            var  zIndex= (currentlySelectedFeature === feature) ? 100 : 1;
            var  width = (currentlySelectedFeature === feature) ? 2 : 1;
            return new ol.style.Style({
                fill: new ol.style.Fill({
                    color: colors[feature.O.membershipType]
                }),
                stroke: new ol.style.Stroke({
                    color: stroke,
                    width: width
                }),
                zIndex: zIndex
            })

        }
    });




   map.addLayer(vector);

    var displayFeatureInfo = function(pixel) {

        var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
            return feature;
        });

        if (feature) {
            currentlySelectedFeature = feature;
            vm.updateParticipantDetails(feature.O);
            var extent = feature.getGeometry().getExtent();
            var longitudeSpan = (extent[2] - extent[0]);
            // A check if to see if the extent of a country crosses the date line, if so zoom to region rather than fit the entire globe
            if(longitudeSpan < 180){
                map.getView().fit(ol.proj.transformExtent(feature.getGeometry().getExtent(), 'EPSG:4326', currentProjection.srs));
            } else {
                zoomToRegion(feature.O.gbifRegion);
            }

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
            projection: 'EPSG:4326',
            maxZoom: maxZoom,
            minZoom: 0
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



    vm.cleanRoles = function(region){

        return function(r){
            if(region === undefined || region === 'GLOBAL' && r.role.indexOf('CHAIR') !== -1){
                return true;
            } else if(r.role.indexOf(region) !== -1) {
                return true;
            } else {
                return false
            }
        }

    }


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

    vm.nonCountryParticipants = [];
    if (vm.nonCountryParticipants.length == 0) {
        DirectoryParticipants.get({'gbifRegion': vm.currentRegion, 'membershipType': 'other_associate_participant'}).$promise
            .then(function(response){
                vm.nonCountryParticipants = response;
            }, function (error){
                return error;
            });
    };

    vm.selectRegion = function(region) {
        vm.showParticipantDetails = false;
        vm.updatedCounts = 0;
        vm.currentRegion = region;
        vm.totalParticipantCount = 0;
        delete vm.contentfulResourceUrl;

            var query = (region !== 'PARTICIPANT_ORGANISATIONS') ? {'gbifRegion': region} : {

                'membershipType': 'other_associate_participant'
            };

            DirectoryParticipantsCount.get(query).$promise
                .then(function (response) {
                    vm.participantTypes.forEach(function (pType) {
                        if (response[pType]) {
                            vm.count[pType] = response[pType];
                            vm.totalParticipantCount += parseInt(response[pType]);
                        }
                        ;
                    });
                    vm.updatedCounts += 1;
                }, function (error) {
                    return error;
                });
            PublisherCount.get(query).$promise
                .then(function (response) {
                    if (response.publisher) vm.count.publisher = $filter('localNumber')(response.publisher, gb.locale);
                    vm.updatedCounts += 1;
                }, function (error) {
                    return error;
                });

           if(vm.currentRegion !== 'GLOBAL') {
               loadParticipantsDigest(vm.currentRegion);

           } else {
               delete vm.activeParticipantsDigest;

               vm.tableLoaded = true;
           };
            loadRegionalReps(vm.currentRegion);

            if (vm.currentRegion !== 'GLOBAL' && vm.currentRegion !== 'PARTICIPANT_ORGANISATIONS') {

                zoomToRegion(region);

            };


        vm.contentfulResourceUrl = '/templates/the-gbif-network/'+region.toLowerCase().replace('_', '-')+'/regionArticle.html?v=' + vm.BUILD_VERSION



        var regionLower = region.toLowerCase().replace('_', '-');
        $state.go($state.$current, {region: regionLower}, {notify: false});

    };

    //vm.currentRegion = $location.path().split('/')[2];
    vm.currentRegion = $stateParams.region;
    if (vm.currentRegion) {
        vm.currentRegion = vm.currentRegion.toUpperCase().replace('-', '_');
        vm.selectRegion(vm.currentRegion);
    }
    else {
        vm.currentRegion = 'GLOBAL';
        vm.selectRegion(vm.currentRegion);
    }

    // For participant table.
    if(vm.currentRegion !== 'GLOBAL') {
        loadParticipantsDigest(vm.currentRegion);
    } else {
        vm.tableLoaded = true;
    };
    function loadParticipantsDigest(region) {
        vm.tableLoaded = false;
        delete vm.activeParticipantsDigest;

        var query = (region !== 'PARTICIPANT_ORGANISATIONS') ? {'gbifRegion': region} : { 'membershipType': 'other_associate_participant'};

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
   // loadRegionalReps(vm.currentRegion);
    function loadRegionalReps(region) {
        vm.repTableLoaded = false;
        delete vm.reps;
        DirectoryNsgContacts.get().$promise
            .then(function(contacts) {

                var idMap = {};

                var reps = contacts.filter(function(contact){

                    if(idMap[contact.id] === true){
                        return false ; // its already there, duplicates from API
                    } else {
                        var picked = false;
                        contact.roles.forEach(function(role){
                            if (region === 'GLOBAL' && role.role.indexOf('CHAIR') !== -1) {
                                picked = true
                            }
                            else if(region !== 'GLOBAL' && role.role.indexOf(region) !== -1){
                                picked = true;
                            }
                        });
                        if(picked === true){
                            idMap[contact.id] = true;
                        }
                        return picked;

                    }


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
