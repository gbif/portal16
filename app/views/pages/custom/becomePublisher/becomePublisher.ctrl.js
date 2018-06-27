'use strict';

var angular = require('angular'),
    ol = require('openlayers'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('becomePublisherCtrl', becomePublisherCtrl);

/** @ngInject */
function becomePublisherCtrl($timeout, $q, $http, constantKeys, suggestEndpoints, Publisher, DirectoryParticipants, Node, NodeCountry, $scope, $sessionStorage, NOTIFICATIONS) {
    var vm = this;
    vm.MAGIC_OBIS_KEY = constantKeys.node.OBIS_NODE_KEY;
    vm.state = {
        notExisting: false,
        hasAdminContact: false,
        hasTechContact: false
    };
    vm.terms = {
        // agreement: true,
        // authorized: true,
        // public: true
    };
    vm.form = {
        comments: {},
        pointOfContact: {type: 'POINT_OF_CONTACT'},
        administrativeContact: {type: 'ADMINISTRATIVE_POINT_OF_CONTACT'},
        technicalContact: {type: 'TECHNICAL_POINT_OF_CONTACT'},
        expectToPublishDataTypes: {},
        suggestedNodeKey: 'other'

    };

    vm.getPublisherSuggestions = function(val) {
        var deferred = $q.defer();
        var publisherSuggestions = $http.get(suggestEndpoints.publisher, {
            params: {
                q: val,
                limit: 10
            }
        });
        publisherSuggestions.then(function(resp) {
            vm.userHaveSearched = true;
            deferred.resolve(resp.data);
        }).catch(function() {
            deferred.reject();
        });
        return deferred.promise;
    };
    vm.getCountrySuggestions = function() {
        var suggestions = $http.get('/api/country/suggest.json');
        suggestions.then(function(resp) {
            vm.countries = resp.data;
        });
    };
    vm.getCountrySuggestions();

    vm.changeCountry = function(country) {
        if (country) {
            if (country === 'TW' && typeof vm.chineseTaipei !== 'undefined' ) {
                 Node.query({identifierType: 'GBIF_PARTICIPANT', identifier: vm.chineseTaipei.id}).$promise
                    .then(function(data) {
                        vm.suggestedCountryNode = _.head(data.results);
                        vm.form.suggestedNodeKey = (vm.suggestedCountryNode) ? vm.suggestedCountryNode.key : 'other';
                    });
            } else {
                NodeCountry.query({countryCode: country}).$promise
                    .then(function(data) {
                        if (data.key && data.participationStatus !== 'OBSERVER' && data.participationStatus !== 'FORMER') {
                            vm.suggestedCountryNode = data;
                            vm.form.suggestedNodeKey = vm.suggestedCountryNode.key;
                        } else {
                            delete vm.suggestedCountryNode;
                            vm.form.suggestedNodeKey = 'other';
                        }
                    });
            }
        }
    };

    vm.getNonCountryParticipants = function() {
        DirectoryParticipants.get({membershipType: 'other_associate_participant'}).$promise
            .then(function(response) {
                vm.nonCountryParticipants = _.filter(response, function(p) {
                    if (p.id === 239 && p.countryCode === 'TW') {
                        vm.chineseTaipei = p;
                    }
                    return p.id !== 239 && p.countryCode !== 'TW';
                });
            }, function(error) {
                return error;
            });
    };
    vm.getNonCountryParticipants();

    vm.setSuggestedNode = function(participantId) {
        Node.query({identifierType: 'GBIF_PARTICIPANT', identifier: participantId}).$promise
            .then(function(data) {
                vm.suggestedNonCountryNode = _.head(data.results);
                vm.form.suggestedNodeKey = ( vm.suggestedNonCountryNode) ? vm.suggestedNonCountryNode.key : undefined;
            });
    };

    vm.selectedPublisherChange = function(item) {
        if (item) {
            Publisher.get({id: item.key}).$promise
                .then(function(publisher) {
                    vm.publisher = publisher;
                    vm.publisher._contact = getContact(vm.publisher);
                    vm.node = Node.get({id: vm.publisher.endorsingNodeKey});
                });
        } else {
            vm.publisher = undefined;
        }
    };

    function getContact(publisher) {
        // remove contacts without a mail
        var p = _.filter(publisher.contacts, function(e) {
            return e.email.length > 0;
        });
        // map to roles
        p = _.keyBy(p, 'type');
        return p.POINT_OF_CONTACT || p.ADMINISTRATIVE_POINT_OF_CONTACT || p.TECHNICAL_POINT_OF_CONTACT;
    }

    // vm.createSuggestion = function () {
    //     $http.post('/api/tools/suggest-dataset', {form: vm.suggestion}, {}).then(function (response) {
    //         vm.referenceId = response.data.referenceId;
    //         vm.state = 'SUCCESS';
    //     }, function () {
    //         vm.state = 'FAILED';
    //     });
    // };

    var map;
    vm.createMap = function() {
        map = new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: 'https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZ2JpZiIsImEiOiJjaWxhZ2oxNWQwMDBxd3FtMjhzNjRuM2lhIn0.g1IE8EfqwzKTkJ4ptv3zNQ'
                    })
                })
            ],
            target: 'organizationMap',
            view: new ol.View({
                center: [0, 0],
                zoom: 1
            }),
            interactions: ol.interaction.defaults({mouseWheelZoom: false}),
            logo: false,
        controls: ol.control.defaults({attribution: false})
        });
        map.on('singleclick', function(evt) {
            setPinOnMap(evt);
        });
    };

    vm.clear = function() {
        map.removeLayer(vm.dynamicPinLayer);
        $timeout(function() {
            vm.form.latitude = vm.form.longitude = undefined;
            vm.dynamicPinLayer = undefined;
        }, 0);
    };

    vm.add = function() {
        setPinOnMap({coordinate: map.getView().getCenter()});
    };

    function setPinOnMap(evt) {
        var latLong = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        $timeout(function() {
            vm.form.latitude = latLong[1];
            vm.form.longitude = latLong[0];
        }, 0);

        if (vm.dynamicPinLayer !== undefined) {
            vm.iconGeometry.setCoordinates(evt.coordinate);
        } else {
            vm.iconGeometry = new ol.geom.Point(evt.coordinate);
            var iconFeature = new ol.Feature({
                geometry: vm.iconGeometry
            });
            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 41],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    size: [25, 41],
                    opacity: 1,
                    src: '/img/marker.png'
                }))
            });

            iconFeature.setStyle(iconStyle);

            var vectorSource = new ol.source.Vector({
                features: [iconFeature]
            });
            vm.dynamicPinLayer = new ol.layer.Vector({
                source: vectorSource
            });
            map.addLayer(vm.dynamicPinLayer);
        }
    }


    vm.createOrganization = function() {
        var body = getBody();
        var creation = $http.post('/api/eoi/create', body);
        creation.then(function(res) {
            vm.state.submissionComplete = true;
            vm.state.submissionError = false;
            vm.state.newPublisherKey = res.data;
        }, function() {
            vm.state.submissionComplete = true;
            vm.state.submissionError = true;
        });
        return creation;
    };

    function getBody() {
        var body = _.assign({}, vm.form);
        body.contacts = [];
        if (vm.state.hasAdminContact && body.administrativeContact.firstName && body.administrativeContact.lastName && body.administrativeContact.email) {
            body.contacts.push(body.administrativeContact);
        }
        if (vm.state.hasTechContact && body.technicalContact.firstName && body.technicalContact.lastName && body.technicalContact.email) {
            body.contacts.push(body.technicalContact);
        }
        body.contacts.push(body.pointOfContact);
        return body;
    }

    vm.notifications = $sessionStorage.notifications;
    $scope.$on(NOTIFICATIONS.CHANGED, function(event, notifications) {
        vm.notifications = notifications;
    });
}

module.exports = becomePublisherCtrl;
