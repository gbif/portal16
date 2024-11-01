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

require('./downloadSpeed.service');

angular
    .module('portal')
    .controller('occurrenceDownloadCtrl', occurrenceDownloadCtrl);

/** @ngInject */
// eslint-disable-next-line max-len
function occurrenceDownloadCtrl($state, $scope, AUTH_EVENTS, $q, $http, OccurrenceFilter, OccurrenceTableSearch, Remarks, env, endpoints, $httpParamSerializer, $uibModal, enums, toastService, $sessionStorage, User, DownloadSpeed, URL_PREFIX) {
    var vm = this;
    vm.stateParams = $state;
    vm.downloadFormats = enums.downloadFormats;
    vm.remarks = {};
    vm.state = OccurrenceFilter.getOccurrenceData();
    vm.hasFossils = false;
    vm.defaultIssueLimit = 1000;
    vm.issueLimit = 1000;
    vm.largeDownloadOffset = 1048576; // above this size, it is not possible to handle it in excel
    vm.veryLargeDownloadOffset = 50000000; // above this size data wrangling is not trivial, i.e. ordinary databases like access, filemaker etc. will not longer suffice
    // Value based on average compression rate of recent downloads
    // (for i in ...lots of recent download archives...; do
    //    zipinfo -t $i.zip | grep %; done) | \
    //    tr -d % | \
    //    awk '{print $9; sum+=$9} END {print "Average compression rate: " sum/NR; print "Unzip Factor: " 1/(1-sum/NR/100.0)}'
    vm.unzipFactor = 4.52617;
    // Values based on average recent download sizes:
    // SELECT format, COUNT(*), AVG(size/total_records)/1000.0 AS kB_per_record, MIN(size/total_records)/1000.0, MAX(size/total_records)/1000.0, STDDEV_SAMP(size/total_records)/1000.0
    // FROM occurrence_download WHERE status = 'SUCCEEDED' AND size > 1e9 AND total_records > 1e6 AND created > '2020-09-01' GROUP BY format ORDER BY format;
    vm.estKbDwcA = 0.35535033259423503330;
    vm.estKbCsv = 0.11619487179487179490;

    vm.adhocTileApi = env.dataApiV2;

    vm.randomize = 'yes';
    vm.taxonomy = 'SPECIES';
    vm.temporal = 'YEAR';
    vm.TAXONOMIC_GROUP = [
        'KINGDOM',
        'PHYLUM',
        'CLASS',
        'ORDER',
        'FAMILY',
        'GENUS',
        'SPECIES',
        'ACCEPTED_TAXON',
        'EXACT_TAXON'
    ];

    vm.TEMPORAL_GROUP = [
        'YEAR',
        'YEARMONTH',
        'DATE'
    ];

    var HIGHER_TAXONOMIC_OPTIONS = [
        'KINGDOM',
        'PHYLUM',
        'CLASS',
        'ORDER',
        'FAMILY',
        'GENUS'
    ];
    
    vm.SPATIAL_GROUP = [
        'EEA_REFERENCE_GRID',
        'EXTENDED_QUARTER_DEGREE_GRID',
        'ISEA3H_GRID',
        'MILITARY_GRID_REFERENCE_SYSTEM'
    ];
    vm.selectedHigherTaxonomyGroups = [];

    var EEA_REFERENCE_GRID_RESOLUTION = [25, 100, 250, 1000, 10000, 100000];
    var EXTENDED_QUARTER_DEGREE_GRID_RESOLUTION = [0, 1, 2, 3, 4, 5, 6];
    var ISEA3H_GRID_RESOLUTION = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    var MILITARY_GRID_REFERENCE_SYSTEM_RESOLUTION = [1, 10, 100, 1000, 10000, 0];
    vm.resolutionOptions = {
        EEA_REFERENCE_GRID: EEA_REFERENCE_GRID_RESOLUTION,
        EXTENDED_QUARTER_DEGREE_GRID: EXTENDED_QUARTER_DEGREE_GRID_RESOLUTION,
        ISEA3H_GRID: ISEA3H_GRID_RESOLUTION,
        MILITARY_GRID_REFERENCE_SYSTEM: MILITARY_GRID_REFERENCE_SYSTEM_RESOLUTION
    };

    vm.setHigherCounts = function() {
        // only allowtaxonomic groups that are higher than the the selected taxonomic group (vm.taxonomy)
        var index = vm.TAXONOMIC_GROUP.indexOf(vm.taxonomy);
        vm.higherTaxonomicGroups = HIGHER_TAXONOMIC_OPTIONS.slice(0, index);
        vm.disableHigherTaxonomy = vm.higherTaxonomicGroups.length === 0;

        // refresh selectedHigherTaxonomyGroups - meaning remove unavaialble values (e.g. union of higherTaxonomicGroups and selectedHigherTaxonomyGroups)
        vm.selectedHigherTaxonomyGroups = _.union(vm.higherTaxonomicGroups, vm.selectedHigherTaxonomyGroups);
    };
    vm.setHigherCounts();

    vm.higherTaxonChange = function(key, checked) {
        vm.higherTaxonomyTypes[key] = checked;
    };

    vm.updateResolutionOptions = function() {
        vm.resolution = undefined;
    };

    vm.isFormValid = function() {
        vm.isValid = !!(vm.taxonomy || vm.temporal || (vm.spatial && vm.resolution));
        return vm.isValid;
    };

    vm.generateSql = function() {
        var query = {
            taxonomy: vm.taxonomy,
            temporal: vm.temporal,
            spatial: vm.spatial,
            resolution: vm.resolution,
            randomize: vm.randomize,
            higherGroups: vm.selectedHigherTaxonomyGroups
        };
        $http.get('http://local:4001/unstable-api/generate-sql', {params: query})
            .then(function(response) {
            })
            .catch(function(err) {
                console.log(err);
            });
    };

    var toCamelCase = function(str) {
        return str.replace(/_([a-z])/g, function(g) {
            return g[1].toUpperCase();
        });
    };

    vm.setThumbnail = function() {
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

    vm.getMostRestrictiveLicense = function(licenseCounts) {
        if (_.get(licenseCounts, 'CC_BY_NC_4_0.count', 0) > 0) {
            return 'license.CC_BY_NC_4_0';
        } else if (_.get(licenseCounts, 'CC_BY_4_0.count', 0) > 0) {
            return 'license.CC_BY_4_0';
        }
        return 'license.CC0_1_0';
    };

    vm.showFossilWarning = function() {
        vm.hasFossils = _.get(vm.state, 'data.facets.BASIS_OF_RECORD.counts.FOSSIL_SPECIMEN.count', 0) > 0;
        return vm.hasFossils;
    };

    vm.showLivingWarning = function() {
        vm.hasLivingSpecimens = _.get(vm.state, 'data.facets.BASIS_OF_RECORD.counts.LIVING_SPECIMEN.count', 0) > 0;
        return vm.hasLivingSpecimens;
    };

    Remarks.then(function(response) {
        vm.remarks = {};
        response.data.map(function(remark) {
            vm.remarks[remark.id] = remark;
        });
    });

    vm.getYearSpan = function() {
        vm.showRange = false;
        var yearQuery = angular.copy(vm.state.query);
        yearQuery.facet = 'year';
        yearQuery['year.facetLimit'] = 10000;
        yearQuery.limit = 0;
        OccurrenceTableSearch.query(yearQuery, function(response) {
            var counts = _.get(response, 'facets.YEAR.counts', []);
            vm.minYear = _.min(Object.keys(counts));
            vm.maxYear = _.max(Object.keys(counts));
            vm.showRange = true;
        }, function() {
            // TODO inform user that count failed by showing failed instead of loader
            vm.showRange = false;
        });
    };

    vm.getWithDate = function() {
        vm.showYears = false;
        var yearQuery = angular.copy(vm.state.query);
        if (typeof yearQuery.year !== 'undefined') {
            vm.withDate = 1;
            vm.showYears = true;
        } else {
            yearQuery.year = '*,3000';
            yearQuery.limit = 0;
            OccurrenceTableSearch.query(yearQuery, function(response) {
                vm.state.table.$promise.then(function() {
                    vm.withDate = response.count / vm.state.table.count;
                    vm.showYears = true;
                });
            }, function() {
                // TODO inform user that count failed by showing failed instead of loader
                vm.showYears = false;
            });
        }
    };

    vm.getTaxonMatchCount = function() {
        vm.showTaxonMatch = false;
        vm.state.data.$promise.then(function() {
            vm.withTaxonMatch = (vm.state.data.count - _.get(vm.state, 'data.facets.ISSUE.counts.TAXON_MATCH_NONE.count', 0)) / vm.state.data.count;
            vm.showTaxonMatch = true;
        });
    };

    vm.analyzeCoordinates = function() {
        vm.showCoordinates = false;
        var locationQuery = angular.copy(vm.state.query);
        locationQuery.facet = ['has_coordinate', 'has_geospatial_issue'];
        OccurrenceTableSearch.query(locationQuery, function(response) {
            var hasCoordinateCounts = _.get(response, 'facets.HAS_COORDINATE.counts', []);
            vm.hasCoordinates = _.get(hasCoordinateCounts, 'true.fraction', 0);
            vm.showCoordinates = true;
        }, function() {
            // TODO inform user that count failed by showing failed instead of loader
            vm.showCoordinates = false;
        });
    };

    vm.sortIssues = function() {
        $q.all([vm.state.data.$promise, Remarks]).then(function() {
            var issues = _.get(vm.state, 'data.facets.ISSUE.counts', {});
            issues = _.values(issues);
            issues.forEach(function(e) {
                e.severity = _.get(vm.remarks, e.title + '.severity', 'INFO');
            });
            issues = issues.filter(function(e) {
                return e.severity === 'ERROR' || e.severity === 'WARNING';
            });
            issues = _.orderBy(issues, ['severity', 'count'], ['asc', 'desc']);
            vm.issueLimit = issues.filter(function(e) {
                return e.severity === 'ERROR';
            }).length + 2;
            vm.issueLimit = Math.max(vm.issueLimit, vm.defaultIssueLimit);
            vm.issues = issues;
        });
    };

    vm.hasData = function() {
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

    $scope.$watch(function() {
        return vm.state.table;
    }, function() {
        vm.updateCounts();
    });

    vm.open = function(format) {
        vm.state.table.$promise.then(function() {
            if (format === 'SQL_CUBE') {
                vm.openSqlModal(format);
            } else if (vm.state.table.count > vm.largeDownloadOffset && format !== 'SPECIES_LIST') {
                vm.openWarningModal(format);
            } else {
                vm.openDownloadModal(format);
            }
        });
    };

    vm.openDownloadModal = function(format) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            controllerAs: '$ctrl',
            resolve: {
                options: function() {
                    return {format: format};
                }
            }
        });

        modalInstance.result.then(function(downloadOptions) {
            vm.startDownload(downloadOptions.format, downloadOptions.username, downloadOptions.password, downloadOptions.email);
        }, function() {
            // user clicked cancel
        });
    };

    vm.openSqlModal = function(format) {
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'simpleSqlDownload.html',
            controller: 'ModalInstanceCtrl',
            controllerAs: '$ctrl',
            resolve: {
                options: function() {
                    return {format: format};
                }
            }
        });

        modalInstance.result.then(function(downloadOptions) {
            vm.startDownload(downloadOptions.format, downloadOptions.username, downloadOptions.password, downloadOptions.email);
        }, function() {
            // user clicked cancel
        });
    };

    vm.openWarningModal = function(format) {
            var filterCount = 0;

            angular.forEach(vm.state.query, function(val, key) {
                    if (key !== 'locale' && key !== 'advanced' && typeof val !== 'undefined') {
                        filterCount ++;
                    }
            });
        vm.state.table.$promise.then(function() {
            var size = (format === 'SIMPLE_CSV') ? vm.estKbCsv : vm.estKbDwcA;

            var fileSizeType = (vm.state.table.count > vm.veryLargeDownloadOffset) ? 'VERY_LARGE' : 'LARGE';

            var modalInstance = $uibModal.open({
                animation: true,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: 'largeDownloadWarning.html',
                controller: 'ModalInstanceCtrl',
                controllerAs: '$ctrl',
                resolve: {
                    options: function() {
                        return {
                            format: format,
                            downloadSpeed: DownloadSpeed.calculate( size * vm.state.table.count * 1024),
                            downloadSize: size * vm.state.table.count * 1024,
                            spaceRequiredForUnzip: size * vm.state.table.count * 1024 * vm.unzipFactor,
                            filterCount: filterCount,
                            fileSizeType: fileSizeType,
                            rowCount: vm.state.table.count

                            };
                    }
                }
            });

            modalInstance.result.then(function() {
                vm.openDownloadModal(format);
            }, function() {
                // user clicked cancel
            });
        });
    };

    vm.startDownload = function(format, username, password, email) {
        var query = _.omitBy(angular.copy(vm.state.query), _.isEmpty);
        query.format = format;
        query.notification_address = email;
        var downloadUrl = endpoints.download + '?' + $httpParamSerializer(query);

        $http.get(downloadUrl).then(function(response) {
            window.location.href = 'download/' + response.data;
        }, function(err) {
            // TODO alert user of failure
            if (err.status === 401) {
                // unauthorized
                toastService.error({translate: 'phrases.errorNotAuthorized'});
            } else if (err.status === 413) {
                // Query too large for the API
                toastService.error({translate: 'phrases.payloadTooLarge'});
            } else if (err.status === 420) {
                // User throttled
                toastService.error({translate: 'occurrenceSearch.errorUserThrottled', readMore: URL_PREFIX + '/restricted'});
            } else {
                toastService.error({translate: 'phrases.criticalErrorMsg'});
            }
        });
    };

    // keep track of whether the user is logged in or not
    function setLoginState() {
        vm.hasUser = !!$sessionStorage.user;
    }
    $scope.$on(AUTH_EVENTS.LOGOUT_SUCCESS, function() {
        setLoginState();
    });
    $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function() {
        setLoginState();
    });
    $scope.$on(AUTH_EVENTS.USER_UPDATED, function() {
        setLoginState();
    });
    User.loadActiveUser();
    setLoginState();
}


angular.module('portal').controller('ModalInstanceCtrl', function($uibModalInstance, options) {
    var $ctrl = this;
    // $ctrl.username;
    // $ctrl.password;
    // $ctrl.email;
    $ctrl.options = options;

    $ctrl.ok = function() {
        $uibModalInstance.close({
            // username: $ctrl.username,
            // password: $ctrl.password,
            // email: $ctrl.email,
            format: $ctrl.options.format
        });
    };

    $ctrl.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});


module.exports = occurrenceDownloadCtrl;

