'use strict';
let angular = require('angular');

angular
    .module('portal')
    .directive('taxonOccImg', function($http, env) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                let url = '/api/species/' + attrs.taxonOccImg + '/occimage';
                $http.get(url, {})
                    .then(function(response) {
                        if (response.status == 200) {
                            element.html('<img src="' + env.imageCache + '64x64/' + encodeURIComponent(response.data) + '" onerror="this.parentElement.style.display=\'none\'" />');
                        }
                    }).catch(function() {
                    // swallow errors
                });
            },
        };
    });
