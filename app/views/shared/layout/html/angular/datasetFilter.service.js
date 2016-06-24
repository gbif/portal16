'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('DatasetFilter', function () {
        var that = this;
        that.state = {};
        return {
            state: that.state
        };
    });