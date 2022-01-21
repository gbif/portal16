'use strict';
var angular = require('angular');

angular
    .module('portal')
    .directive('concept', function($http, $filter, $q, LOCALE) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var vocabulary = attrs.vocabulary;
                var name = attrs.name;

                // get async count from endpoint
                element.html('<span>' + name + '</span>');
                var vocabPromise = $http.get('https://api.gbif.org/v1/vocabularies/' + vocabulary + '/concepts/' + name);

                vocabPromise.then(function(response) {
                  var label = $filter('vocabularyLabel')(response.data);
                  element.html(label);
                }).catch(function() {
                    // if this fails, then the fallback will just be the concept name (ID)
                });
            }
        };
    });
