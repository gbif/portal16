'use strict';

var angular = require('angular');

angular
    .module('portal')
    .factory('Page', pageFactory);

/** @ngInject */
function pageFactory() {
    var title = undefined;
    return {
        title: function() { return title; },
        setTitle: function(newTitle) { title = newTitle; }
    };
}

module.exports = pageFactory;