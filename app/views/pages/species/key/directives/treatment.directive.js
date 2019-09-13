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

        vm.baselayer = {
            url: 'https://tile.gbif.org/3857/omt/{z}/{x}/{y}@1x.png?style=osm-bright-en&srs=EPSG%3A3857',
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright" target="_blank" class="inherit">OpenStreetMap contributors</a>'
        };
        var occurrences = OccurrenceSearch.get({datasetKey: vm.species.datasetKey, taxonKey: vm.species.nubKey, limit: 500});

        occurrences.$promise.then(function() {
            if (occurrences.results && occurrences.results.length > 0) {
                var filteredOccurrences = occurrences.results ? occurrences.results.filter(function(data) {
                    return (typeof data.decimalLatitude !== 'undefined' && typeof data.decimalLongitude !== 'undefined') && (data.canonicalName === vm.species.canonicalName);
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
                                    message: '<div>' + typeHeader + '<p><a href="/occurrence/' + o.key + '">' + o.verbatimLabel + '</a></p></div>',
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

