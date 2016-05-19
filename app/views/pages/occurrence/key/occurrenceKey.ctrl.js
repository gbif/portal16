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
    .controller('occurrenceKeyCtrl', occurrenceKeyCtrl);

/** @ngInject */
function occurrenceKeyCtrl(Occurrence, leafletData, SimilarOccurrence, OccurrenceVerbatim, env, moment, $http, $firebaseArray) {
    var vm = this;
    vm.comments;
    vm.detailsStates = {
        INTERPRETED: 0,
        COMPARE: 1,
        DIFF: 2
    };
    vm.dataApi = env.dataApi;
    vm.detailsState = vm.detailsStates.INTERPRETED;
    vm.compare = true;
    vm.similarities = {
        similarRecords: []
    };
    vm.hideDetails = true;

    vm.SimilarOccurrence = SimilarOccurrence;//.getSimilar({TAXONKEY: 2435146});
    vm.center = {zoom: 9, lat: 0, lng: 0};
    vm.markers = {};
    var accessToken = 'pk.eyJ1IjoiZ2JpZiIsImEiOiJjaWxhZ2oxNWQwMDBxd3FtMjhzNjRuM2lhIn0.g1IE8EfqwzKTkJ4ptv3zNQ';

    vm.tiles = {
        "name": "Outdoor",
        "url": "https://api.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=" + accessToken,
        options: {
            attribution: "&copy; <a href='https://www.mapbox.com/'>Mapbox</a> <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap contributors</a>",
            detectRetina: false //TODO can this be fixed? Currently the mapbox retina tiles have such a small text size that I'd prefer blurry maps that I can read
        },
        type: 'xyz',
        layerOptions: {
            "showOnSelector": false,
            palette: 'yellows_reds'
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
    vm.table = {
        filter: undefined
    };

    vm.deleteComment = function(index) {
        vm.comments.$remove(index).then(function(){});
    };

    vm.addComment = function() {
        vm.comments.$add({ comment: vm.newComment }).then(function(){
            vm.newComment = '';
        });
    };


    vm.setData = function() {
        //TODO find a better way to parse required data to controller from server without seperate calls
        vm.occurrenceFields = gb.occurrenceFields;
        vm.verbatim = gb.occurrenceRecordVerbatim;
        vm.data = gb.occurrenceRecord;
        setMap(vm.data);
        getWeather(vm.data.decimalLatitude, vm.data.decimalLongitude, vm.data.eventDate);

        //https://www.firebase.com/docs/web/libraries/angular/api.html#angularfire-firebasearray
        var comments = $firebaseArray(new Firebase('https://glowing-heat-751.firebaseio.com/occurrence/' + vm.data.key));

        // make the list available in the DOM
        vm.comments = comments;

    };

    vm.parseDate = function(date) {
        return moment(date).format('MMMM DD, YYYY');
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
                function(){
                    //console.log("error " + error);
                    //TODO handler errors from api
                }
            );
        }
    }

    function getElevation(lat, lng) {
        var n, s, e, w, dist = 0.05;
        if (lat && lng) {
            n = lat + dist;
            s = lat - dist;
            e = lat + dist;
            w = lat - dist;
            var query = {
                shape: [
                    {
                        lat: n, lon: lng
                    },
                    {
                        lat: s, lon: lng
                    }
                ],
                range: true, 
                resample_distance: 50
            };

            // var elevationApi = 'https://elevation.mapzen.com/height?api_key=elevation-u7RCaXn&json=' + JSON.stringify(query);
            // $http.get(elevationApi).then(
            //     function(response){
            //         vm.barData.series[0] = response.data.range_height.map(function(e){
            //             return e[1];
            //         });
            //     },
            //     function(){
            //         //console.log("error " + error);
            //         //TODO handler errors from api
            //     }
            // );
        }
    }


    function setMap(data) {
        if (typeof data.decimalLatitude === 'undefined' || typeof data.decimalLongitude === 'undefined') {
            return
        }
        getElevation(data.decimalLatitude, data.decimalLongitude);

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
            zoom: 10,
            lat: data.decimalLatitude,
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
            // vm.SimilarOccurrence.getSimilar(
            //     {
            //         geometry: map.getBounds(),
            //         taxonkey: data.taxonKey,
            //         eventdate: data.eventDate
            //     },
            //     data.key,
            //     function(data) {
            //         vm.similarities.similarRecords = data.results;
            //         var markers = vm.SimilarOccurrence.getMarkers(data, {
            //             key: vm.data.key,
            //             eventDate: vm.data.eventDate,
            //             decimalLatitude: vm.data.decimalLatitude,
            //             decimalLongitude: vm.data.decimalLongitude
            //         });
            //         markers.forEach(function(e, i) {
            //             vm.markers['marker_' + i] = e;
            //         });
            //     }
            // );

            var a= L.latLng(data.decimalLatitude, data.decimalLongitude);
            var projPos = map.project(a, 0);
            vm.tilePosStyle = {
                left: projPos.x/2.56 + '%',
                top: projPos.y/2.56 + '%',
                display: 'block'
            };
            map.once('focus', function() { map.scrollWheelZoom.enable(); });
        });
    }
}

module.exports = occurrenceKeyCtrl;