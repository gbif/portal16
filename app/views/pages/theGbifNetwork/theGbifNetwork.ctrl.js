'use strict';

require('../../shared/layout/html/angular/topoJson.resource');

var angular = require('angular'),
    moment = require('moment'),
topojson = require('topojson');

angular
    .module('portal')
    .controller('theGbifNetworkCtrl', theGbifNetworkCtrl);

/** @ngInject */
function theGbifNetworkCtrl(DirectoryParticipants, DirectoryParticipantsCount, PublisherCount, LiteratureCount, $scope, $filter, $stateParams, $location, ParticipantsDigest, DirectoryNsgContacts, WorldTopoJson, leafletData, ParticipantHeads, PublisherEndorsedBy, CountryDataDigest, $q, $translate, $timeout) {
    var vm = this;

    vm.validRegions = ['GLOBAL', 'AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'NORTH_AMERICA', 'OCEANIA'];
    var regionCenters = {
        'GLOBAL': {zoom: 2, lat: 40, lng: 0},
        'ASIA': {zoom: 4, lat: 11, lng: 114},
        'AFRICA': {zoom: 3, lat: 6.6, lng: 16.4},
        'EUROPE': {zoom: 4, lat: 56, lng: 11},
        'LATIN_AMERICA': {zoom: 3, lat: -15, lng: -86},
        'NORTH_AMERICA': {zoom: 3, lat: 51, lng: -107},
        'OCEANIA': {zoom: 4, lat: -33.5, lng: 138}
    };



    vm.membershipType = 'active';
    vm.showChart = false;
    vm.tableLoaded = false;

    $scope.$watch($scope.showChart, function(){
        vm.showchart = $scope.showChart;
    });

    vm.center = regionCenters['GLOBAL'];


    L.TopoJSON = L.GeoJSON.extend({
        addData: function(jsonData) {
            if (jsonData.type === "Topology") {

                for (var key in jsonData.objects) {
                    var geojson = topojson.feature(jsonData, jsonData.objects[key]);
                    L.GeoJSON.prototype.addData.call(this, geojson);
                }
            }
            else {
                L.GeoJSON.prototype.addData.call(this, jsonData);
            }
        }
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

    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 2,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        vm.updateParticipantDetails(layer.feature.properties);
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        };
    };


    function resetHighlight(e) {
        topoLayer.resetStyle(e.target);
        vm.showParticipantDetails = false;
    };

    function zoomToFeature(e) {
        leafletData.getMap('theNetworkMap').then(function(map) {
            map.fitBounds(e.target.getBounds());
            resetHighlight(e);
        })


    };

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });
    };

    var topoLayer;

    leafletData.getMap('theNetworkMap').then(function(map){
        WorldTopoJson.get().$promise.then(function(topoJson){
            topoLayer =  new L.TopoJSON(topoJson, {
                style: function(feature) {
                    switch (feature.properties.membershipType) {
                        case 'voting_participant':    return {fillColor: '#4E9F37', color: 'white', weight: 1, fillOpacity: 0.4};
                        case 'associate_country_participant':  return {fillColor: '#58BAE9', color: 'white', weight: 1, fillOpacity: 0.4};
                    }
                },
                onEachFeature: onEachFeature
            });
            topoLayer.addData(topoJson);
            topoLayer.addTo(map);
            vm.mapIsLoaded = true;
        });
    })

    var accessToken = 'pk.eyJ1IjoiZ2JpZiIsImEiOiJjaWxhZ2oxNWQwMDBxd3FtMjhzNjRuM2lhIn0.g1IE8EfqwzKTkJ4ptv3zNQ';

    vm.highlights = {
        issues: {
            expanded: false
        }
    };
    vm.tiles = {
        "name": "Outdoor",
        "url": "https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=" + accessToken,
        options: {
            attribution: "&copy; <a href='https://www.mapbox.com/'>Mapbox</a> <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap contributors</a>",
            detectRetina: false //TODO can this be fixed? Currently the mapbox retina tiles have such a small text size that I'd prefer blurry maps that I can read
        },
        type: 'xyz',
        layerOptions: {
            "showOnSelector": false,
            palette: 'yellows_reds'
        }
    };
    vm.mapDefaults = {
        zoomControlPosition: 'topleft',
        scrollWheelZoom: false
    };
    vm.mapEvents = {
        map: {
            enable: [], //https://github.com/tombatossals/angular-leaflet-directive/issues/1033
            logic: 'broadcast'
        },
        marker: {
            enable: [],
            logic: 'broadcast'
        }
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
        vm.updatedCounts = 0;
        vm.currentRegion = region;
        vm.totalParticipantCount = 0;
        DirectoryParticipantsCount.get({'gbifRegion': region}).$promise
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
        PublisherCount.get({'gbifRegion': region}).$promise
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
        vm.center = regionCenters[region];

        var regionLower = region.toLowerCase().replace('_', '-');
        $location.path('/the-gbif-network/' + regionLower);
        // $state.go('theGbifNetwork', {region: regionLower})
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


    // EventUtil.addHandler(window, 'scroll', function () {
    //     if (document.compatMode == 'CSS1Compat') {
    //
    //         if (document.body.scrollTop >= offsetTop - 50) {
    //             regionNav.classList.add(topClass);
    //             mapStrip.classList.add(paddingClass);
    //         } else {
    //             regionNav.classList.remove(topClass);
    //             mapStrip.classList.remove(paddingClass);
    //         }
    //
    //     }
    // });
}

module.exports = theGbifNetworkCtrl;
