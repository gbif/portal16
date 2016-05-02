(function () {
    'use strict';
    var angular = require('angular');
    
    angular
        .module('portal')
        .constant('env', {
            dataApi: 'http://api.gbif.org/v1/', //e.g //api.gbif.org/v1/
            tileApi: 'cdn.gbif.org/v1/map/density/tile.png' //e.g. //cdn.gbif.org/v1/map/density/tile.png
        })
})();