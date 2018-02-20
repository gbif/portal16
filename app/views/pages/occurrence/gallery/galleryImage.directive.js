'use strict';
var angular = require('angular');

angular
    .module('portal')
    .directive('galleryImage', function() {
        return {
            restrict: 'A',
            scope: {
                onImgError: '='
            },
            link: function(scope, element, attrs) {
                var thinner = 0.6,
                    thin = 0.8,
                    wide = 1.4,
                    wider = 1.8,
                    widest = 2.0;

                element.on('load', function() {
                    element.parent().css({
                        'background-image': 'url("' + attrs.src + '")'
                    });

                    var ratio = (element[0].naturalWidth) / element[0].naturalHeight;
                    if (ratio > widest) element.parent().attr('data-width', 'widest');
                    else if (ratio > wider && ratio <= widest) element.parent().attr('data-width', 'wider');
                    else if (ratio > wide && ratio <= wider) element.parent().attr('data-width', 'wide');
                    else if (ratio > thinner && ratio <= thin) element.parent().attr('data-width', 'thin');
                    else if (ratio <= thinner) element.parent().attr('data-width', 'thinner');
                    element.parent().addClass('isValid');
                });

                element.on('error', function() {
                    element.parent().css({
                        'background-image': 'url("/img/brokenDoc.png")'
                    });
                    element.parent().attr('data-width', 'wide');
                    element.parent().addClass('isInvalid');
                    // element.parent().html('<span></span>');
                    if (typeof scope.onImgError === 'function') {
                        scope.$apply(function(scope) {
                            var fn = scope.onImgError();
                            if ('undefined' !== typeof fn) {
                                fn();
                            }
                        });
                    }
                });
            }
        };
    });
