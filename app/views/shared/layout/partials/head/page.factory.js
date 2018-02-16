'use strict';

let angular = require('angular');

angular
    .module('portal')
    .factory('Page', pageFactory);

/** @ngInject */
function pageFactory() {
    let title = undefined,
        drawer = false;
    return {
        title: function() {
 return title;},
        setTitle: function(newTitle) {
 title = newTitle;},
        drawer: function(drawerBool) {
            if (typeof drawerBool === 'boolean') {
                drawer = drawerBool;
            }
            return drawer;
        },
    };
}

module.exports = pageFactory;
