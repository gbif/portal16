'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .service('SimilarOccurrence', function (OccurrenceSearch) {
                this.test = 'hej';

                this.getSimilar = function (query, cb) {
                    OccurrenceSearch.query(query, function (data) {
                        //debugger;
                    }, function (error) {
                        //debugger;
                    });
                };

                this.leafletBoundsToWkt = function (bounds) {
                    var bTemplate = 'w n, e n, e s, w s, w n';
                    //var bTemplate = 'n w, n e, s e, s w, n w';
                    var b = bTemplate
                        .replace(/n/g, bounds.getNorth())
                        .replace(/s/g, bounds.getSouth())
                        .replace(/e/g, bounds.getEast())
                        .replace(/w/g, bounds.getWest());
                    return 'POLYGON(('+b+'))';
                }
            }
        );
})();

