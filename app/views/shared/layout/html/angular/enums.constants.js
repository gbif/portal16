(function() {
    'use strict';
    let angular = require('angular'),
        enums = require('../../../../../models/enums/allEnums');

    angular
        .module('portal')
        .constant('enums', enums);
})();
