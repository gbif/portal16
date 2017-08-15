'use strict';
var _ = require('lodash');
var angular = require('angular');

angular
    .module('portal')
    .controller('developerMapsCtrl', developerMapsCtrl);

/** @ngInject */
function developerMapsCtrl($state, $stateParams, $anchorScroll, Network, NetworkDatasets, BUILD_VERSION) {
    // var vm = this;
    // vm.BUILD_VERSION = BUILD_VERSION;
    //
    // var baseUrl = "http://api.gbif.org/v1/map" + '/density/tile?x={x}&y={y}&z={z}';
    //
    // // Based on the preview content, build the tile template url
    // function getGBIFUrl() {
    //     var layers="";
    //     _.each(angular.element( document.querySelector('.layer')), function(i) {
    //         var d = angular.element(i);
    //         if (d.prop('checked')) {
    //             console.log(d.attr('id'))
    //             layers =layers + "&layer=" + d.attr('id');
    //         }
    //     });
    //
    //     var palette = "";
    //     _.each(angular.element( document.querySelector('.color')), function(i) {
    //         var d = angular.element(i);
    //         if (d.prop('checked')) {
    //             if (d.attr('id') == "custom") {
    //                 palette="&colors=" + encodeURIComponent(angular.element( document.querySelector('#colorset')).val());
    //             } else {
    //                 palette ="&palette=" + d.attr('id');
    //             }
    //         }
    //     });
    //
    //     var url = baseUrl
    //         + "&type=" + angular.element( document.querySelector("#type")).val()
    //         + "&key=" + angular.element( document.querySelector("#key")).val()
    //         + layers
    //         + palette;
    //     // console.log("GBIF layer template url: " +  url);
    //     angular.element( document.querySelector("#urlTemplate")).html("<a href='" + url + "'>" + url + "</a>");
    //     return url;
    // }
    //
    // var gbifAttrib='GBIF contributors';
    // var gbif = new L.TileLayer(getGBIFUrl(), {minZoom: 0, maxZoom: 14, attribution: gbifAttrib});
    // var cmAttr = '© OpenMapTiles © OpenStreetMap contributors',
    //     cmUrl = 'https://tile.gbif.org/3857/omt/{z}/{x}/{y}@1x.png?style=osm-bright';
    // var minimal   = L.tileLayer(cmUrl, {styleId: 22677, attribution: cmAttr, tileSize: 512, zoomOffset: -1});
    //
    // var map = L.map('map', {
    //     center: [0, 0],
    //     zoom: 1,
    //     maxZoom: 14,
    //     layers: [minimal, gbif]
    // });
    //
    //
    // angular.element( document.querySelector('.refresh,.layer,.color')).bind('click',function(event) {
    //     gbif.setUrl(getGBIFUrl());
    // });
    //
    // // prototype util function
    // if (typeof String.prototype.startsWith != 'function') {
    //     String.prototype.startsWith = function (str){
    //         return this.indexOf(str) == 0;
    //     };
    // }
    //
    // angular.element( document.querySelector('.toggle')).bind('click',function(e) {
    //     e.preventDefault();
    //     _.each(angular.element( document.querySelector('.layer')), function(i,d) {
    //         if (d.id.startsWith(e.target.id)) {
    //             d.checked = !d.checked;
    //         }
    //     });
    //     gbif.setUrl(getGBIFUrl());
    // });
}


module.exports = developerMapsCtrl;
