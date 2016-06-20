'use strict';

var angular = require('angular');

angular
    .module('portal')
    .service('DatasetFilter', function ($stateParams, $state, DatasetSearch) {
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

        that.search = function(cb) {
            DatasetSearch.query(that.query, function (data) {
                that.data = data;
                cb(that.data);
            }, function () {
            });
        };

        return {
            getQuery: function(){return that.query;},
            query: that.query,
            setCurrentTab: that.setCurrentTab,
            activeTab: that.activeTab,
            search: that.search,
            getData: function(){return that.data;},
        };
    });