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
function occurrenceDownloadCtrl($state, $scope, AUTH_EVENTS, $q, $http, OccurrenceFilter, OccurrenceTableSearch, Remarks, env, endpoints, $httpParamSerializer, $uibModal, enums, toastService, $sessionStorage, User) {
    var vm = this;
    vm.stateParams = $state;
    vm.downloadFormats = enums.downloadFormats;
    vm.remarks = {};
    vm.state = OccurrenceFilter.getOccurrenceData();
    vm.hasFossils = false;
    vm.defaultIssueLimit = 1000;
    vm.issueLimit = 1000;
    vm.estKbDwcA = 0.165617009; //based on 111GB for 702777671 occurrences in “DWCA"
    vm.estKbCsv = 0.065414979; //based on 44GB for 705302432 occurrences in CSV

    vm.adhocTileApi = env.dataApiV2;

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

    vm.clearFreeText = function() {
        vm.state.query.q = undefined;
        $state.go($state.current, vm.state.query, {inherit: false, notify: true, reload: false});
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

    vm.showLivingWarning = function () {
        vm.hasLivingSpecimens = _.get(vm.state, 'data.facets.BASIS_OF_RECORD.counts.LIVING_SPECIMEN.count', 0) > 0;
        return vm.hasLivingSpecimens;
    };

    Remarks.then(function (response) {
        vm.remarks = {};
        response.data.map(function (remark) {
            vm.remarks[remark.id] = remark;
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
        }, function () {
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
            vm.hasCoordinates = _.get(hasCoordinateCounts, 'true.fraction', 0);
            vm.showCoordinates = true;
        }, function () {
            //TODO inform user that count failed by showing failed instead of loader
            vm.showCoordinates = false;
        });
    };

    vm.sortIssues = function() {
        $q.all([vm.state.data.$promise, Remarks]).then(function(){
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
            vm.issueLimit = Math.max(vm.issueLimit, vm.defaultIssueLimit);
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

    vm.open = function (format) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            controllerAs: '$ctrl',
            resolve: {
                format: function () {
                    return format;
                }
            }
        });

        modalInstance.result.then(function (downloadOptions) {
            vm.startDownload(downloadOptions.format, downloadOptions.username, downloadOptions.password, downloadOptions.email);
        }, function () {
            //user clicked cancel
        });
    };

    vm.startDownload = function(format, username, password, email) {
        var query = _.omitBy(angular.copy(vm.state.query), _.isEmpty);
        query.format = format;
        query.notification_address = email;
        var downloadUrl = endpoints.download + '?' + $httpParamSerializer(query);

        $http.get(downloadUrl).then(function (response) {
            window.location.href = 'download/' + response.data;
        }, function(err) {
            //TODO alert user of failure
            if (err.status == 401) {
                //unauthorized
                toastService.error({
                    message: 'Login failed - if you created your account recently it might not work on this demo site yet.'
                });
            } else {
                toastService.error({
                    message: 'We currently cannot process your download request. Please report the error if it continues.'
                });
            }
        });
    };

    //keep track of whether the user is logged in or not
    function setLoginState() {
        vm.hasUser = !!$sessionStorage.user;
    }
    $scope.$on(AUTH_EVENTS.LOGOUT_SUCCESS, function () {
        setLoginState();
    });
    $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function () {
        setLoginState();
    });
    $scope.$on(AUTH_EVENTS.USER_UPDATED, function () {
        setLoginState();
    });
    User.loadActiveUser();
    setLoginState();
}


angular.module('portal').controller('ModalInstanceCtrl', function ($uibModalInstance, format) {
    var $ctrl = this;
    //$ctrl.username;
    //$ctrl.password;
    //$ctrl.email;
    $ctrl.format = format;

    $ctrl.ok = function () {
        $uibModalInstance.close({
            //username: $ctrl.username,
            //password: $ctrl.password,
            //email: $ctrl.email,
            format: $ctrl.format
        });
    };

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});




module.exports = occurrenceDownloadCtrl;

