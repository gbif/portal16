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

        that.activeTab;
        that.setCurrentTab = function() {
            switch ($state.current.name) {
                case 'occurrenceSearchMap':
                    that.activeTab = that.tabStates.MAP;
                    break;
                case 'occurrenceSearchGallery':
                    that.activeTab = that.tabStates.GALLERY;
                    break;
                default:
                    that.activeTab = that.tabStates.TABLE;
            }
        };
        that.setCurrentTab();

        return {
            getQuery: function() {
                return angular.copy($stateParams);
            },
            query: that.query,
            setCurrentTab: that.setCurrentTab,
            activeTab: that.activeTab
        };
    });