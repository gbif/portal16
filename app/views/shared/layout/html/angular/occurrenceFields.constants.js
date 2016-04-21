var angular = require('angular');

(function () {
    'use strict';
    var occurrenceFields = require('../../../../../models/gbifdata/occurrence/occurrenceFields');
    angular
        .module('portal')
        .constant('occurrenceFields', {
            test: occurrenceFields
        });
})();