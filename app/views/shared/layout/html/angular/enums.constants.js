(function () {
    'use strict';
    var angular = require('angular'),
        enums = require('../../../../../models/enums.json');

    angular
        .module('portal')
        .constant('enums', enums);
})();