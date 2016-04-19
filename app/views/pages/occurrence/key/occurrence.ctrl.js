'use strict';

/*
HEADLINE with batch infos
MAP LOCATION
SUMMARY + FREE?
FREE? COMPOSED? e.g. last seen in area OR estimated temperature OR species traits OR suspicious data
MEDIA
SIMILAR
DETAILS
GBIF SPECIFIC INFO
*/

var angular = require('angular');

angular
    .module('portal')
    .controller('occurrenceCtrl', occurrenceCtrl);

/** @ngInject */
function occurrenceCtrl(Occurrence, leafletData, SimilarOccurrence, OccurrenceFragment, moment, $http, $firebaseObject, $firebaseArray) {
    var vm = this;

    // var ref = new Firebase("https://glowing-heat-751.firebaseio.com/test");
    // //download the data into a local object
    // vm.syncObj = $firebaseObject(ref); //this will ensure your binding will work
    // // synchronize the object with a three-way data binding
    // // click on `index.html` above to see it used in the DOM!

    vm.comments;
    


    vm.similarities = {
        similarRecords: []
    };
    vm.fragment;
    vm.fieldNames = [
        {
            gbif: 'key',
            verbatim: 'key'
        },
        {
            gbif: 'datasetKey',
            verbatim: 'datasetKey'
        },
        {
            gbif: 'publishingOrgKey',
            verbatim: 'publishingOrgKey'
        },
        {
            gbif: 'publishingCountry',
            verbatim: 'publishingCountry'
        },
        {
            gbif: 'protocol',
            verbatim: 'protocol'
        },
        {
            gbif: 'lastCrawled',
            verbatim: 'lastCrawled'
        },
        {
            gbif: 'lastParsed',
            verbatim: 'lastParsed'
        },
        {
            gbif: 'basisOfRecord',
            verbatim: 'basisOfRecord'
        },
        {
            gbif: 'taxonKey',
            verbatim: 'taxonKey'
        },
        {
            gbif: 'kingdomKey',
            verbatim: 'kingdomKey'
        },
        {
            gbif: 'phylumKey',
            verbatim: 'phylumKey'
        },
        {
            gbif: 'classKey',
            verbatim: 'classKey'
        },
        {
            gbif: 'orderKey',
            verbatim: 'orderKey'
        },
        {
            gbif: 'familyKey',
            verbatim: 'familyKey'
        },
        {
            gbif: 'genusKey',
            verbatim: 'genusKey'
        },
        {
            gbif: 'speciesKey',
            verbatim: 'speciesKey'
        },
        {
            gbif: 'kingdom',
            verbatim: 'kingdom'
        }
    ];
    vm.SimilarOccurrence = SimilarOccurrence;//.getSimilar({TAXONKEY: 2435146});
    vm.center = {zoom: 7, lat: 0, lng: 0};
    vm.markers = {};

    vm.tiles = {
        url: "http://2.maps.nlp.nokia.com/maptile/2.1/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?app_id=_peU-uCkp-j8ovkzFGNU&app_code=gBoUkAMoxoqIWfxWA5DuMQ",
        options: {
            attribution: '&copy; <a href="https://legal.here.com/en/terms/serviceterms/us/">Nokia</a>'
        }
    };
    vm.mapDefaults = {
        zoomControlPosition: 'topleft',
        scrollWheelZoom: false
   };
   vm.mapEvents = {
        map: {
            enable: [], //https://github.com/tombatossals/angular-leaflet-directive/issues/1033
            logic: 'broadcast'
        },
        marker: {
            enable: [],
            logic: 'broadcast'
        }
    };

    vm.paths =  {

    };


    vm.tilePosStyle = {};
    vm.data;

vm.deleteComment = function(index) {
    vm.comments.$remove(index).then(function(){});
}

vm.addComment = function() {
    vm.comments.$add({ comment: vm.newComment }).then(function(){
        vm.newComment = '';
    });
}
    vm.setData = function() {
        vm.data = occurrenceRecord; //TODO find a better way to parse required data to controller from server without seperate calls
        setMap(vm.data);
        getWeather(occurrenceRecord.decimalLatitude, occurrenceRecord.decimalLongitude, occurrenceRecord.eventDate);

        //https://www.firebase.com/docs/web/libraries/angular/api.html#angularfire-firebasearray
        var comments = $firebaseArray(new Firebase('https://glowing-heat-751.firebaseio.com/occurrence/' + occurrenceRecord.key));

        // make the list available in the DOM
        vm.comments = comments;

    };

    vm.parseDate = function(date) {
        return moment(date).format('MMMM DD, YYYY');
    };

    vm.isOneMissing = function(field) {
        var typeGbif = typeof vm.data === 'undefined' || typeof vm.data[field.gbif] === 'undefined';
        var typeFragment = typeof vm.fragment === 'undefined' || typeof vm.fragment[field.verbatim] === 'undefined';
        if ( (typeGbif || typeFragment) && (!typeGbif || !typeFragment)) {
            //xor is undefined
            return true;
        }
        return false;
    };

    vm.weather = {};
    function getWeather(lat, lng, date) {
        if (lat && lng && date) {
            date = moment(date).unix();
            var weatherUrl = '/api/weather/' + lat + '/' + lng + '/' + date;
            $http.get(weatherUrl).then(
                function(response){
                    vm.weather = response.data;
                },
                function(error){
                    message('Couldn\'t get role types', 'error');
                }
            );
        }
    }


    function setMap(data) {
        if (typeof data.decimalLatitude === 'undefined' || typeof data.decimalLongitude === 'undefined') {
            return
        }
        vm.markers.taxon = {
            //group: 'similar',
            lat: data.decimalLatitude,
            lng: data.decimalLongitude,
            focus: false
        };
        if (data.verbatimLocality) {
            vm.markers.taxon.message = '<p>'+data.verbatimLocality+'</p>';
        }
        vm.center = {
            zoom: 6,
            lat: data.decimalLatitude+0.4,
            lng: data.decimalLongitude
        };
        if (data.coordinateAccuracyInMeters > 50) {
            vm.paths.c1 = {
                weight: 2,
                color: '#ff612f',
                latlngs: {
                    lat: data.decimalLatitude,
                    lng: data.decimalLongitude
                },
                radius: data.coordinateAccuracyInMeters/2,
                type: 'circle'
            };
        }

        //set static marker
        leafletData.getMap('occurrenceMap').then(function(map) {
            //find similar records (same species, same time, same area). This gives context and can tell us whether there are possible duplicates or several people reporting the same individual
            // Useful examples as of april 2016: 195092389
            vm.SimilarOccurrence.getSimilar(
                {
                    geometry: map.getBounds(),
                    taxonkey: data.taxonKey, //TODO isn't always a species key
                    eventdate: data.eventDate
                },
                data.key,
                function(data) {
                    vm.similarities.similarRecords = data.results;
                    var markers = vm.SimilarOccurrence.getMarkers(data, {
                        key: vm.data.key,
                        eventDate: vm.data.eventDate,
                        decimalLatitude: vm.data.decimalLatitude,
                        decimalLongitude: vm.data.decimalLongitude
                    });
                    markers.forEach(function(e, i) {
                        vm.markers['marker_' + i] = e;
                    });
                }
            );

            var a= L.latLng(data.decimalLatitude, data.decimalLongitude);
            var projPos = map.project(a, 0);
            vm.tilePosStyle = {
                left: projPos.x/2.56 + '%',
                top: projPos.y/2.56 + '%',
                display: 'block'
            };
            map.once('focus', function() { map.scrollWheelZoom.enable(); });
        });

        OccurrenceFragment.get({id: data.key}, function (data) {
            vm.fragment = data;
        }, function (error) {
            debugger;
        });
    }
}

module.exports = occurrenceCtrl;