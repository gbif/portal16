'use strict';

var angular = require('angular');
var ol = require('openlayers');

angular
    .module('portal')
    .directive('treatment', treatmentDirective);

/** @ngInject */
function treatmentDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/pages/species/key/directives/treatment.html',
        scope: {},
        controller: treatmentCtrl,
        controllerAs: 'treatment',
        bindToController: {
            treatment: '=',
            figures: '=',
            species: '='
        }
    };
    return directive;

    /** @ngInject */
    function treatmentCtrl(OccurrenceSearch) {
        var vm = this;

        // replace broken links in treatment
        vm.treatment = vm.treatment.replace(new RegExp('http://plazi.cs.umb.edu', 'g'), 'http://treatment.plazi.org');

        vm.figuresExpanded = true;
        vm.mapExpanded = true;
        vm.baselayer = {
            url: 'https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?',
            attribution: '&copy; <a href="https://www.mapbox.com/" class="inherit">Mapbox</a>, '
            + '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" class="inherit">OpenStreetMap contributors</a>',
            params: {
                access_token: 'pk.eyJ1IjoiZ2JpZiIsImEiOiJjaWxhZ2oxNWQwMDBxd3FtMjhzNjRuM2lhIn0.g1IE8EfqwzKTkJ4ptv3zNQ'
            }
        };
        var occurrences = OccurrenceSearch.get({datasetKey: vm.species.datasetKey, taxonKey: vm.species.nubKey, limit: 500});

        occurrences.$promise.then(function() {
            if (occurrences.results && occurrences.results.length > 0) {
                var filteredOccurrences = occurrences.results ? occurrences.results.filter(function(data) {
                    return (typeof data.decimalLatitude !== 'undefined' && typeof data.decimalLongitude !== 'undefined');
                }).sort(function(a, b) {
                    if (a.typeStatus && a.typeStatus.toLowerCase() === 'holotype') {
                        return 1;
                    } else if (b.typeStatus && b.typeStatus.toLowerCase() === 'holotype') {
                        return -1;
                    } else {
                        return 0;
                    }
                }) : [];

                if (filteredOccurrences.length > 0) {
                    var geoJSON = {
                        type: 'FeatureCollection',
                        features: filteredOccurrences.map(function(o) {
                            var typeHeader = o.typeStatus ? '<h4>' + o.typeStatus + '</h4>' : '';
                            return {
                                type: 'Feature',
                                geometry: {
                                    coordinates: [o.decimalLongitude, o.decimalLatitude],
                                    type: 'Point'
                                },
                                properties: {
                                    key: o.key,
                                    message: '<div>' + typeHeader + '<p>' + o.verbatimLabel + '</p></div>',
                                    title: o.typeStatus ? o.typeStatus + ': ' + o.verbatimLabel : o.verbatimLabel
                                }
                            };
                        })
                    };
                    vm.featureStyle = new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: 4,
                            fill: new ol.style.Fill({
                                color: 'blue'
                            }),
                            stroke: new ol.style.Stroke({color: 'blue', width: 2})
                        })
                    });

                    vm.geoJSON = geoJSON;
                    vm.projection = 'EPSG:3857';
                }
            }
        });
    }
}

module.exports = treatmentDirective;

