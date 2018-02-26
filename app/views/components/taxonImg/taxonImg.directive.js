'use strict';
var angular = require('angular');

angular
    .module('portal')
    .directive('taxonImg', function($http, env) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var url = '/api/species/' + attrs.taxonImg + '/image';
                $http.get(url, {})
                    .then(function(response) {
                        angular.element(document).ready(function() {
                            var lightbox = new Lightbox();
                            lightbox.load();
                        });

                        var image = response.data;
                        if (response.status == 200) {
                            element.html(
                                '<img style="cursor: pointer" src="' +
                                env.imageCache + '64x64/' + encodeURIComponent(response.data.identifier) +
                                '" onerror="this.parentElement.style.display=\'none\'" data-jslghtbx="' + env.imageCache + '1200x900/' + encodeURIComponent(response.data.identifier) +
                                '" data-jslghtbx-caption="' + ((image.rightsHolder) ? ('&copy; ' + image.rightsHolder ) : '&copy; ' + image.creator) +
                                ((image.license) ? '<br> License: ' + image.license : '') + '" />');
                        }
                    }).catch(function() {
                    // swallow errors
                });
            }
        };
    });


