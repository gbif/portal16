let angular = require('angular');

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

                let ignore;
                if (attr.clickOutsideUnless) {
                    ignore = $parse(attr.clickOutsideUnless);
                }

                let nakedEl = el[0];
                let fn = $parse(attr.clickOutside);

                let handler = function(e) {
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
            },
        };
    }
})();
