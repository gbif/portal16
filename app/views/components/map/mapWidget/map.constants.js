var angular = require('angular'),
    baseMaps = require('./baseMapConfig');

(function() {
    angular
        .module('portal')
        .constant('baseMaps', baseMaps);
})();
