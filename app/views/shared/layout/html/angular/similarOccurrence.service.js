'use strict';

var angular = require('angular');
var moment = require('moment');

(function() {
    'use strict';

    angular
        .module('portal')
        .service('SimilarOccurrence', function(OccurrenceSearch) {
            var that = this;
            that.dateBufferInDays = 0;
            that.limit = 50;

            this.getSimilar = function(query, occurrenceKey, cb, errcb) {
                query.limit = that.limit;
                query.has_geospatial_issue = false;
                query.geometry = that.leafletBoundsToWkt(query.geometry);
                var date = moment(query.eventdate);
                if (that.dateBufferInDays > 0) {
                    query.eventdate = date.subtract(that.dateBufferInDays, 'days').format('YYYY-MM-DD') + ',' + date.add(that.dateBufferInDays + that.dateBufferInDays, 'days').format('YYYY-MM-DD');
                } else {
                    query.eventdate = date.format('YYYY-MM-DD');
                }

                OccurrenceSearch.query(query, function(data) {
                    if (data.count >= 1) {
                        data.count = data.count - 1;
                        data.results = data.results.filter(function(e) {
                            return e.key != occurrenceKey;
                        });
                    }
                    cb(data);
                }, function(error) {
                    errcb(error);
                });
            };
            // TODO if this should be used, move away from leaflet
            this.leafletBoundsToWkt = function(bounds) {
                var bTemplate = 'w n,e n,e s,w s,w n';
                var b = bTemplate
                    .replace(/n/g, Math.min(bounds.getNorth(), 90))
                    .replace(/s/g, Math.max(bounds.getSouth(), -90))
                    .replace(/e/g, Math.min(bounds.getEast(), 180))
                    .replace(/w/g, Math.max(bounds.getWest(), -180));
                return 'POLYGON((' + b + '))';
            };

            this.getMarkers = function(data, settings) {
                var markers = [];
                if (data.count > 1) {
                    data.results.forEach(function(e) {
                        var timeDiff;
                        if (e.eventDate == settings.eventDate) {
                            timeDiff = 'Same time';
                        } else {
                            var eDate = moment(e.eventDate);
                            var occDate = moment(settings.eventDate);
                            timeDiff = eDate.from(occDate, false);
                            if (eDate.isBefore(occDate)) {
                                timeDiff += ' before';
                            } else {
                                timeDiff += ' after';
                            }
                        }
                        var message = '<p>' + timeDiff + '</p>';
                        message += '<p>Same species</p>';
                        if (e.datasetKey == data.datasetKey) message += '<p>Same <a href="/dataset/' + data.datasetKey + '">data set</a></p>';
                        if (e.decimalLatitude == settings.decimalLatitude && e.decimalLongitude == settings.decimalLongitude) message += '<p>Same location</p>';
                        message += '<p><a href="' + e.key + '">See record</a></p>';
                        markers.push(
                            {
                                group: 'similar',
                                lat: e.decimalLatitude || 0,
                                lng: e.decimalLongitude || 0,
                                message: message
                            }
                        );
                    });
                }
                return markers;
            };


            return {
                getSimilar: this.getSimilar,
                getMarkers: this.getMarkers
            };
        });
})();

