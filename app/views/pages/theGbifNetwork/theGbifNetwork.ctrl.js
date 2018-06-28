'use strict';

require('./theGbifNetworkMap.service');

var angular = require('angular'),
    _ = require('lodash'),
    ol = require('openlayers');

angular
    .module('portal')
    .controller('theGbifNetworkCtrl', theGbifNetworkCtrl);


/** @ngInject */
// eslint-disable-next-line max-len
function theGbifNetworkCtrl( $scope, $state, $stateParams, ParticipantsDigest, DirectoryNsgContacts, ParticipantHeads, PublisherEndorsedBy, CountryDataDigest, $q, BUILD_VERSION, GBIFNetworkMapService, $timeout) {
    var vm = this;
    vm.BUILD_VERSION = BUILD_VERSION;
    vm.locale = gb.locale;
    vm.validRegions = ['GLOBAL', 'AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'NORTH_AMERICA', 'OCEANIA'];
    var regionCenters = {
        'GLOBAL': {zoom: 2, lat: 0, lng: 9, extent: [-160.1015625, -84.55078125, 178.1015625, 84.55078125]},
        'ASIA': {zoom: 3, lat: 11, lng: 114, extent: [29.44921875, -31.275390625, 198.55078125, 53.275390625]},
        'AFRICA': {zoom: 3, lat: 6.6, lng: 16.4, extent: [-68.15078125, -35.675390625, 100.95078125, 48.875390625]},
        'EUROPE': {zoom: 3.8, lat: 50, lng: 11, extent: [-37.561671667794585, 25.719164166102708, 59.561671667794585, 74.2808358338973]},
        'LATIN_AMERICA': {zoom: 3, lat: -15, lng: -86, extent: [-170.55078125, -57.275390625, -1.44921875, 27.275390625]},
        'NORTH_AMERICA': {zoom: 3, lat: 51, lng: -107, extent: [-191.55078125, 8.724609375, -22.44921875, 93.275390625]},
        'OCEANIA': {zoom: 4, lat: -30, lng: 138, extent: [95.724609375, -51.1376953125, 180.275390625, -8.8623046875]}
    };


    var maxZoom = 7;
    var mapElement = document.getElementById('theNetworkMap');
    var currentProjection = GBIFNetworkMapService.get4326();
    var map = new ol.Map({
        target: mapElement,
        layers: [
            currentProjection.getBaseLayer({style: 'gbif-light'})
        ],
        interactions: ol.interaction.defaults({mouseWheelZoom: false}),
        controls: ol.control.defaults({attribution: false})

    });


    map.setView(currentProjection.getView(0, 0, 1, 1, maxZoom));
    if (currentProjection.fitExtent) {
        map.getView().fit(currentProjection.fitExtent);
    }


    var colors = {voting_participant: '#4E9F37', associate_country_participant: '#58BAE9'};

    var currentlySelectedFeature;

    var vector = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: '/api/topojson/world/participants',

            format: new ol.format.TopoJSON(),
            overlaps: false
        }),
        style: function(feature) {
            var stroke = (currentlySelectedFeature === feature) ? '#000000' : '#FFFFFF';
            var zIndex = (currentlySelectedFeature === feature) ? 100 : 1;
            var width = (currentlySelectedFeature === feature) ? 2 : 1;
            return new ol.style.Style({
                fill: new ol.style.Fill({
                    color: colors[feature.getProperties().membershipType] || '#A9A9A9'
                }),
                stroke: new ol.style.Stroke({
                    color: stroke,
                    width: width
                }),
                zIndex: zIndex
            });
        }
    });


   map.addLayer(vector);

    var displayFeatureInfo = function(pixel) {
        var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
            return feature;
        });

        if (feature) {
            currentlySelectedFeature = feature;
            vm.updateParticipantDetails(feature.getProperties());
            var extent = feature.getGeometry().getExtent();
            var longitudeSpan = (extent[2] - extent[0]);
            // A check if to see if the extent of a country crosses the date line, if so zoom to region rather than fit the entire globe
            if (longitudeSpan < 180) {
                map.getView().fit(ol.proj.transformExtent(feature.getGeometry().getExtent(), 'EPSG:4326', currentProjection.srs));
            } else {
                zoomToRegion(feature.getProperties().gbifRegion);
            }
        } else {
            vm.showParticipantDetails = false;
        }
    };


    map.on('click', function(evt) {
        displayFeatureInfo(evt.pixel);
    });

    vm.mapIsLoaded = true;

    var zoomToRegion = function(region) {
       map.getView().fit(regionCenters[region].extent);
    };

    vm.membershipType = 'active';
    vm.showChart = false;
    vm.tableLoaded = false;

    $scope.$watch($scope.showChart, function() {
        vm.showchart = $scope.showChart;
    });


    vm.updateParticipantDetails = function(props) {
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
        }
        if (props && props.countryCode) {
            tasks.digest = CountryDataDigest.get({iso2: props.countryCode}).$promise;
            tasks.digest.catch(function() {
                vm.participantApiError = true;
            });
        }

        $q.all(tasks).then(function(results) {
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
        })
            .catch(function() {
                vm.participantApiError = true;
            });
    };


    vm.cleanRoles = function(region) {
        return function(r) {
            if (region === undefined || region === 'GLOBAL' && r.role.indexOf('CHAIR') !== -1) {
                return true;
            } else if (r.role.indexOf(region) !== -1) {
                return true;
            } else {
                return false;
            }
        };
    };

    vm.count = {};
    vm.participantTypes = [
        'voting_participant',
        'associate_country_participant',
        'other_associate_participant',
        'gbif_affiliate'
    ];
    vm.query = $stateParams;

    vm.selectRegion = function(region) {
        var oldRegion = vm.currentRegion;
        vm.showParticipantDetails = false;
        vm.currentRegion = region;
        vm.totalParticipantCount = 0;
        delete vm.contentfulResourceUrl;


        loadParticipantsDigest(vm.currentRegion);

            loadRegionalReps(vm.currentRegion);

            if (vm.currentRegion !== 'PARTICIPANT_ORGANISATIONS' && vm.currentRegion !== 'GBIF_AFFILIATES') {
                var latency = (oldRegion === 'PARTICIPANT_ORGANISATIONS' || oldRegion === 'GBIF_AFFILIATES') ? 500 : 0;
              $timeout(function() {
                  zoomToRegion(region);
              }, latency);
            }

        vm.contentfulResourceUrl = '/templates/the-gbif-network/' + region.toLowerCase().replace('_', '-') + '/regionArticle.html?v=' + vm.BUILD_VERSION + '&locale=' + vm.locale;
        var regionLower = region.toLowerCase().replace('_', '-');
        $state.go($state.$current, {region: regionLower}, {notify: false});
    };

    vm.currentRegion = $stateParams.region;
    if (vm.currentRegion) {
        vm.currentRegion = vm.currentRegion.toUpperCase().replace('-', '_');
        vm.selectRegion(vm.currentRegion);
    } else {
        vm.currentRegion = 'GLOBAL';
        vm.selectRegion(vm.currentRegion);
    }

    // For participant table.
    function loadParticipantsDigest(region) {
        vm.tableLoaded = false;
        delete vm.activeParticipantsDigest;

        var query;

        switch (region) {
            case 'PARTICIPANT_ORGANISATIONS':
                query = {'membershipType': 'other_associate_participant'};
                break;
            case 'GBIF_AFFILIATES':
                query = {'membershipType': 'gbif_affiliate'};
                break;
            default:
                query = {'gbifRegion': region};
        }
        var publisherCount = 0;

        vm.participantTypes.forEach(function(pType) {
            vm.count[pType] = 0;
        });
        vm.count.occurrence = 0;
        vm.count.dataset = 0;


        ParticipantsDigest.get(query).$promise
            .then(function(response) {
                // duplicate some counts for sorting.
                response.forEach(function(r) {
                    ['occurrenceFromCount', 'datasetFromCount'].forEach(function(c) {
                        if (r.counts.hasOwnProperty(c)) {
                            r[c + 'Sort'] = r.counts[c];
                        }
                    });

                    if (r.counts && !isNaN(r.counts.occurrenceFromCount)) {
                        vm.count.occurrence += r.counts.occurrenceFromCount;
                    }
                    if (r.counts && !isNaN(r.counts.datasetFromCount)) {
                        vm.count.dataset += r.counts.datasetFromCount;
                    }

                    if (r.hasOwnProperty('endorsedPublishers')) {
                        r.endorsedPublishersSort = r.endorsedPublishers;
                        publisherCount += r.endorsedPublishers;
                    }

                    vm.count[r.membershipType] ++;
                });

                vm.count.publisher = publisherCount;
                if (regionCenters[region]) {
                response = response.filter(function(p) {
                    return p.participationStatus !== 'AFFILIATE';
                });
                }
                vm.activeParticipantsDigest = response;
                vm.tableLoaded = true;
            })
            .catch(function() {
                vm.participantApiError = true;
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

                var reps = contacts.filter(function(contact) {
                    if (idMap[contact.id] === true) {
                        return false; // its already there, duplicates from API
                    } else {
                        var picked = false;
                        contact.roles.forEach(function(role) {
                            if (region === 'GLOBAL' && role.role.indexOf('NODES_COMMITTEE') !== -1 && role.role.indexOf('CHAIR') !== -1) {
                                picked = true;
                            } else if (region !== 'GLOBAL' && role.role.indexOf(region) !== -1) {
                                picked = true;
                            }
                        });
                        if (picked === true) {
                            idMap[contact.id] = true;
                        }

                        return picked;
                    }
                });
                if (region !== 'GLOBAL') {
                    reps.sort(function(a) {
                        return (_.find(a.roles, function(r) {
                            return (r.role.indexOf(region) !== -1 && r.role.indexOf('DEPUTY') !== -1);
                        })) ? 1 : -1;
                    });
                }

                vm.reps = reps;
                vm.repTableLoaded = true;
            }, function(error) {
                return error;
            });
    }
    vm.toggleStatus = {};
    vm.toggleDetail = function(personId) {
        // true means show
        if (vm.toggleStatus[personId] && vm.toggleStatus[personId] == 'contact--show') {
            vm.toggleStatus[personId] = false;
        } else {
            vm.toggleStatus[personId] = 'contact--show';
        }
    };
}

module.exports = theGbifNetworkCtrl;
