'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('HelpService', function($state) {
        var state = {
            identifier: undefined,
            isCms: true,
            open: false
        };

        return {
            getState: function() {
                return state;
            },
            updateState: function(open, identifier, isCms) {
                state.open = !!open || false;
                state.identifier = identifier;
                state.isCms = isCms !== false;
            }
        };
    });
