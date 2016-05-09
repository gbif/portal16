'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('OccurrenceFilter', function ($stateParams, $state) {
        var that = this;
        that.query = angular.copy($stateParams);
        that.tabStates = Object.freeze({
            TABLE: 'TABLE',
            MAP: 'MAP',
            GALLERY: 'GALLERY'
        });
        that.currentTab = that.tabStates.TABLE;
        switch ($state.current.name) {
            case 'occurrenceSearchMap':
                that.currentTab = that.tabStates.MAP;
                break;
            case 'occurrenceSearchGallery':
                that.currentTab = that.tabStates.GALLERY;
                break;
            default:
                that.currentTab = that.tabStates.TABLE;
        }
        return {
            getQuery: function(){return that.query;},
            query: that.query,
            tabStates: that.tabStates,
            currentTab: that.currentTab
        };
    });