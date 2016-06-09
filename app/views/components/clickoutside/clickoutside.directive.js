var angular = require('angular');

module.exports = (function() {
    'use strict';

    angular
        .module('gb-click-outside', [])
        .directive('clickOutside', ['$window', '$document', '$parse', clickOutside]);

    function clickOutside($window, $document, $parse) {
        return {
            restrict: 'A',
            link: function(scope, el, attr) {
                if (!attr.clickOutside) {
                    return;
                }

                var ignore;
                if (attr.clickOutsideUnless) {
                    ignore = $parse(attr.clickOutsideUnless);
                }

                var nakedEl = el[0];
                var fn = $parse(attr.clickOutside);

                var handler = function(e) {
                    if (nakedEl === e.target || nakedEl.contains(e.target) || (ignore && ignore(scope))) {
                        return;
                    }
                    scope.$apply(fn);
                };

                function _hasTouch() {
                    return 'ontouchstart' in window || navigator.maxTouchPoints;
                }

                $window.addEventListener('click', handler, true);

                if (_hasTouch()) {
                    $window.addEventListener('touchstart', handler, true);
                }

                scope.$on('$destroy', function() {
                    $document.off('click', handler);
                    $document.off('touchstart', handler);
                });
            }
        };
    }
})();