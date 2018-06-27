'use strict';
var angular = require('angular');

angular
    .module('portal')
    .directive('count', function($http, $filter, $q, LOCALE, $translate) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var url = attrs.count;
                var countType = attrs.countType;
                var countTranslation = attrs.countTranslation;

                // get async count from endpoint
                element.html('<span class="loading"></span>');
                var countPromise = $http.get(url, {
                    params: {
                        limit: 0
                    }
                });

                // allow subtractions. @THOMAS - I'm not sure I think this belongs here. Wouædn't it make better sense that those two places you need it just didn't use this directive instead? 
                // https://github.com/gbif/portal16/blame/52ee341091b25db4849dbc1b3dc21ea51483e508/app/views/components/count/count.directive.js
                var promise = (typeof attrs.subtract === 'undefined') ? countPromise : $q.all([countPromise, $http.get(attrs.subtract, {
                    params: {
                        limit: 0
                    }
                })]).then(function(response) {
                    response[0].data.count = (response[0].data.count - response[1].data.count);
                    return response[0];
                });

                promise.then(function(response) {
                    var number = $filter('localNumber')(getCount(response.data, countType), LOCALE);
                    if (countTranslation) {
                        // Allow async counts to be used in translations
                        $translate(countTranslation, {NUMBER: number, NUMBER_FORMATED: $filter('localNumber')(number)}).then(function(translation) {
                            element.html(translation);
                        });
                    } else {
                        element.html(number);
                    }
                    element.addClass('loaded');
                }).catch(function() {
                    // swallow errors//TODO how to handle this in a gerneal way. in some cases, the count might be essential. Perhaps then this isn't the directive to use?
                });
            }
        };
    });

function getCount(data, type) {
    if (type === 'facet') {
        return data.facets[0].counts.length;
    } else {
        return data.count;
    }
}