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
                element.on('load', function() {
                    element.parent().css({
                        'background-image': 'url("' + attrs.src + '")'
                    });

                    var ratio = (element[0].naturalWidth) / element[0].naturalHeight;
                    ratio = Math.min(2.9, ratio);
                    ratio = Math.max(.1, ratio);
                    for (var r = .1; r < 3; r += .1) {
                      if (ratio < r + .1) {
                        // element.parent().attr('data-width', 'ratio_' + (Math.floor(r * 10) / 10).toString().replace('.', '_'));
                        element.parent().attr('data-width', 'ratio_' + ratio.toFixed(1).replace('.', '_'));
                        break;
                      }
                    }
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
