/**
 * search types?
 * auto complete
 * integer is [between, below, above]
 * date interval etc
 * enum list, multiselect
 */
'use strict';
var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('occurrenceDownloadCtrl', occurrenceDownloadCtrl);

/** @ngInject */
function occurrenceDownloadCtrl($scope, $q, OccurrenceFilter, OccurrenceTableSearch, Remarks, env, $httpParamSerializer) {
    var vm = this;
    vm.remarks = {};
    vm.state = OccurrenceFilter.getOccurrenceData();
    vm.hasFossils = false;
    vm.issueLimit = 7;
    vm.estKbDwcA = 0.165617009; //based on 111GB for 702777671 occurrences in “DWCA"
    vm.estKbCsv = 0.065414979; //based on 44GB for 705302432 occurrences in CSV

    vm.adhocTileApi = env.dataApiV2;//.replace('//', ''); //TODO this becomes an issue everywhere we use subdomains. If not http2 then this should be done differently

    var toCamelCase = function (str) {
        return str.replace(/_([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });
    };

    vm.setThumbnail = function () {
        vm.loadingThumbnail = true;
        vm.thumbnail = vm.adhocTileApi + 'map/occurrence/adhoc/0/0/0.png?srs=EPSG:4326&style=classic.poly&' + toCamelCase($httpParamSerializer(vm.state.query));
    };

    vm.onThumbLoad = function() {
        vm.loadingThumbnail = false;
    };

    vm.getMostRestrictiveLicense = function (licenseCounts) {
        if (_.get(licenseCounts, 'CC_BY_NC_4_0.count', 0) > 0) {
            return 'license.CC_BY_NC_4_0';
        } else if (_.get(licenseCounts, 'CC_BY_4_0.count', 0) > 0) {
            return 'license.CC_BY_4_0';
        }
        return 'license.CC0_1_0';
    };

    vm.showFossilWarning = function () {
        vm.hasFossils = _.get(vm.state, 'data.facets.BASIS_OF_RECORD.counts.FOSSIL_SPECIMEN.count', 0) > 0;
        return vm.hasFossils;
    };

    Remarks.then(function (response) {
        vm.remarks = {};
        response.data.remarks.map(function (remark) {
            vm.remarks[remark.type] = remark;
        });
    });

    vm.getYearSpan = function () {
        vm.showRange = false;
        var yearQuery = angular.copy(vm.state.query);
        yearQuery.facet = 'year';
        yearQuery['year.facetLimit'] = 10000;
        yearQuery.limit = 0;
        OccurrenceTableSearch.query(yearQuery, function (response) {
            var counts = _.get(response, 'facets.YEAR.counts', []);
            vm.minYear = _.min(Object.keys(counts));
            vm.maxYear = _.max(Object.keys(counts));
            vm.showRange = true;
        }, function (err) {
            //TODO inform user that count failed by showing failed instead of loader
            vm.showRange = false;
        });
    };

    vm.getWithDate = function () {
        vm.showYears = false;
        var yearQuery = angular.copy(vm.state.query);
        if (typeof yearQuery.year !== 'undefined') {
            vm.withDate = 1;
            vm.showYears = true;
        } else {
            yearQuery.year = '*,3000';
            yearQuery.limit = 0;
            OccurrenceTableSearch.query(yearQuery, function (response) {
                vm.state.table.$promise.then(function(){
                    vm.withDate = response.count / vm.state.table.count;
                    vm.showYears = true;
                });
            }, function () {
                //TODO inform user that count failed by showing failed instead of loader
                vm.showYears = false;
            });
        }
    };

    vm.getTaxonMatchCount = function() {
        vm.showTaxonMatch = false;
        vm.state.data.$promise.then(function () {
            vm.withTaxonMatch = (vm.state.data.count - _.get(vm.state, 'data.facets.ISSUE.counts.TAXON_MATCH_NONE.count', 0)) / vm.state.data.count;
            vm.showTaxonMatch = true;
        });
    };

    vm.analyzeCoordinates = function () {
        vm.showCoordinates = false;
        var locationQuery = angular.copy(vm.state.query);
        locationQuery.facet = ['has_coordinate', 'has_geospatial_issue'];
        OccurrenceTableSearch.query(locationQuery, function (response) {
            var hasCoordinateCounts = _.get(response, 'facets.HAS_COORDINATE.counts', []);
            var hasIssuesCounts = _.get(response, 'facets.HAS_GEOSPATIAL_ISSUE.counts', []);
            vm.hasCoordinates = _.get(hasCoordinateCounts, 'true.fraction', 0);
            vm.showCoordinates = true;
        }, function () {
            //TODO inform user that count failed by showing failed instead of loader
            vm.showCoordinates = false;
        });
    };

    vm.sortIssues = function() {
        $q.all([vm.state.data.$promise, Remarks]).then(function(results){
            var issues = _.get(vm.state, 'data.facets.ISSUE.counts', {});
            issues = _.values(issues);
            issues.forEach(function(e){
                e.severity = _.get(vm.remarks, e.title + '.severity', 'INFO')
            });
            issues = issues.filter(function(e){
                return e.severity === 'ERROR' || e.severity === 'WARNING';
            });
            issues = _.orderBy(issues, ['severity', 'count'], ['asc', 'desc']);
            vm.issueLimit = issues.filter(function(e){
                return e.severity === 'ERROR';
            }).length + 2;
            vm.issueLimit = Math.max(vm.issueLimit, 5);
            vm.issues = issues;
        });
    };

    vm.hasData = function () {
        return typeof vm.state.table.count !== 'undefined';
    };

    vm.updateCounts = function() {
        vm.getWithDate();
        vm.getTaxonMatchCount();
        vm.analyzeCoordinates();
        vm.getYearSpan();
        vm.sortIssues();
        vm.setThumbnail();
    };
    vm.updateCounts();

    $scope.$watch(function () {
        return vm.state.table;
    }, function () {
        vm.updateCounts();
    });
}

module.exports = occurrenceDownloadCtrl;

