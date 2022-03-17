'use strict';
var _ = require('lodash'),
    moment = require('moment-timezone'),
    fixedUtil = require('../../dataset/key/main/submenu');

require('./feedback.service');


// only available on dev for now
// var devApiUrl = '//api.gbif-dev.org/v1/';

angular
    .module('portal')
    .controller('dataValidatorKeyCtrl', dataValidatorKeyCtrl);

/** @ngInject */
function dataValidatorKeyCtrl($http, $scope, User, AUTH_EVENTS, $stateParams, $state, $timeout, DwcExtension, Remarks, $location, $sessionStorage, validatorFeedbackService, env, LOCALE_MAPPINGS, LOCALE) {
    var vm = this;
    vm.moment = moment;
    vm.dataApi = env.dataApi;
    vm.$state = $state;
    vm.toggleFeedback = validatorFeedbackService.toggleFeedback;


    vm.issueSampleExpanded = {};
    vm.issuesMap = {};
    vm.remarks = {};
    vm.criticalIssues = {};
    vm.dwcextensions = DwcExtension.get();
    Remarks.then(function(response) {
        vm.remarks = {};
        response.data.map(function(remark) {
            vm.remarks[remark.id] = remark;
        });
    });

    function updateAccess() {
        var user = $sessionStorage.user;
      //  vm.isRepoUser = User.hasRole(USER_ROLES.REPOSITORY_USER);
        vm.isLoggedIn = !!user;
            vm.hasApi401Error = false;
            vm.hasError = false;
            vm.getValidationResults(vm.jobid);       
    }
   
    $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function() {
        updateAccess();
    });
    $scope.$on(AUTH_EVENTS.LOGOUT_SUCCESS, function() {
        updateAccess();
    });

    $http.get(
        vm.dataApi + 'validator/evaluation/nonindexable'

    ).success(function(data) {
        vm.criticalIssues = _.keyBy(data, function(s) {
            return s;
        });
    });

    vm.getToken = function() {
        return vm.token ? Promise.resolve() : $http({url: '/api/token', method: 'GET', headers: {'Authorization': 'Bearer ' + User.getAuthToken()}})
        .success(function(data, status) {
            vm.token = data.token;
        })
        .error(function(data, status) {
            // let the validation endpoint decide if Auth is needed
           // handleWSError(data, status);
        });
    };

    vm.getValidationResults = function(jobid) {
        // let the validation endpoint decide if Auth is needed
        vm.getToken().finally(function() {
            var conf = {
                method: 'GET',
                url: vm.dataApi + 'validation/' + jobid + '?nonse=' + Math.random()      
            };
            if (vm.token) {
                conf.headers = {'Authorization': 'Bearer ' + vm.token};
            }
            $http(conf)
            .success(function(data) {
                vm.startTimestamp = moment(data.created).locale(_.get(LOCALE_MAPPINGS, 'moment.' + LOCALE, 'en')).local().fromNow();
                vm.generatedDateFormatted = moment(data.created).locale(_.get(LOCALE_MAPPINGS, 'moment.' + LOCALE, 'en')).local().format('MMMM Do YYYY, h:mm a');
                vm.generatedDate = moment(data.created).locale(_.get(LOCALE_MAPPINGS, 'moment.' + LOCALE, 'en')).local().format('LL');
               handleValidationSubmitResponse(data);
            }).error(function(err, status) { // data, status, headers, config
                if ((err && err.statusCode === 404) || status === 404) {
                    handleValidationSubmitResponse(err);
                } else {
                    handleWSError(err, status);
                }
            });
        }
        );
    };

    if ($stateParams.jobid) {
        vm.jobid = $stateParams.jobid;


        loadEvaluationCategory().then(function() {
            vm.getValidationResults(vm.jobid);
        });
    } else if ($sessionStorage.gbifRunningValidatonJob) {
        $state.go('dataValidatorKey', {jobid: $sessionStorage.gbifRunningValidatonJob});
    }

    function loadEvaluationCategory() {
        return $http({
            url: vm.dataApi + 'validator/enumeration/simple/EvaluationCategory'
        }).success(function(data) {
            vm.evaluationCategory = data;
        }).error(function(err, status) { // data, status, headers, config
            handleWSError(err, status);
        });
    }
    vm.retries404 = 10;
    function handleValidationSubmitResponse(data) {
        vm.jobStatus = data.status;
        vm.steps = _.get(data, 'metrics.stepTypes', []);

        if ((data.status === 'DOWNLOADING' || data.status === 'QUEUED' || data.status === 'RUNNING' || data.status === 'SUBMITTED' || data.status === 'ACCEPTED' || data.status === 'NOT_FOUND') && data.key) {
            /* currently the validator webservice may return 404 and then after a few attempts it will return 200
                We give it 5 attempts before throwing 404

             */
            vm.jobId = data.key;
            if (data.status === 'NOT_FOUND') {
                vm.retries404--;
            } else {
                vm.retries404 = 10;
            }
            $timeout(function() {
                if ($state.is('dataValidatorKey')) {
                    if (data.status === 'NOT_FOUND' && vm.retries404 < 1) {
                        delete $sessionStorage.gbifRunningValidatonJob;

                        handleWSError(data, 404);
                    } else {
                        $sessionStorage.gbifRunningValidatonJob = data.key;
                        // pretend the job is running if we haven´t reached 404 retry limit
                        if (data.status === 'NOT_FOUND' && vm.retries404 > 0) {
                            vm.jobStatus = 'CONTACTING_SERVER';
                        }
                        if (data.status === 'DOWNLOADING' || data.status === 'QUEUED' || data.status === 'RUNNING' || data.status === 'SUBMITTED' && data.result) {
                            vm.dwcextensions.$promise.then(function() {
                                handleValidationResult(data);
                            });
                        }
                        vm.getValidationResults($stateParams.jobid);
                    }
                } else if ($state.is('dataValidator')) {
                    $state.go('dataValidatorKey', {jobid: vm.jobId});
                }
            }, 1000);
        } else if (data.status === 'FINISHED' || data.status === 'FAILED') {
            delete $sessionStorage.gbifRunningValidatonJob;

            var port = ($location.port() !== 80 && $location.port() !== 443) ? ':' + $location.port() : '';

            vm.jobUrl = $location.protocol() + '://' + $location.host() + port + $location.path();
            handleValidationResult(data);
        }
    }

    var sortIssues = function(issues) {
        return _.sortBy(issues, [
            function(issue) {
                return (issue.severity === 'INFO') ? 3 : (issue.severity === 'WARNING') ? 2 : 1;
            },
            function(issue) {
                return (issue.count) ? (- parseInt(issue.count)) : 0;
            }
        ]);
    };

    function getIssueSeverity(e) {
        //  return (vm.remarks[e]) ? vm.remarks[e].severity : "WARNING";
        return (vm.remarks[e]) ? vm.remarks[e].severity : (vm.criticalIssues[e]) ? 'ERROR' : 'WARNING';
    }

    vm.getIssueSeverity = getIssueSeverity;

    function handleValidationResult(responseData) {
        var data = responseData.metrics;
        vm.steps = _.get(data, 'stepTypes', []);
        vm.file = _.get(responseData, 'file');
        if (!_.isNaN(_.get(responseData, 'fileSize'))) {
            if (Number(_.get(responseData, 'fileSize')) < 100000 ) {
                vm.fileSize = (Number(_.get(responseData, 'fileSize')) / 1000).toFixed(0) + ' kb';
            } else if (Number(_.get(responseData, 'fileSize')) >= 100000 ) {
                vm.fileSize = ((Number(_.get(responseData, 'fileSize')) / 1000000).toFixed(1)) + ' mb';
            }
        }        
        data.files.sort(function(a, b) {
            if (a.fileType === 'CORE' && b.fileType !== 'CORE') {
                return -1;
            } else if (a.fileType !== 'CORE' && b.fileType === 'CORE') {
                return 1;
            } else {
                return 0;
            }
        });

        vm.extensionCount = 0;

        for (var i = 0; i < data.files.length; i++) {
            if (data.files[i].fileType === 'CORE') {
                vm.coreDataType = data.files[i].rowType;
            } else if (data.files[i].fileType === 'EXTENSION') {
                vm.extensionCount++;
            }
        }

        vm.validationResults = {
            summary: _.omit(data, 'results'),
            results: [],
            indexeable: _.get(data, 'indexeable')
        };
        vm.validationResults.summary.fileFormat = _.get(responseData, 'fileFormat');
        vm.validationResults.summary.issueTypesFound = {};
        vm.unknownTermMap = {};

        angular.forEach(data.files, function(resourceResult) {
            var vmResourceResult = _.omit(resourceResult, 'issues');
            // the order of the evaluationCategory is important
            vmResourceResult.issues = _.orderBy(resourceResult.issues, function(value) {
                return _.indexOf(vm.evaluationCategory, value.issueCategory);
            });

            // prepare terms frequency
            if (resourceResult.termsFrequency) {
                for (var i = 0; i < resourceResult.termsFrequency.length; i++) {
                    var key = Object.keys(resourceResult.termsFrequency[i])[0];
                    resourceResult.termsFrequency[i].key = key;
                    resourceResult.termsFrequency[i].count = resourceResult.termsFrequency[i][key];
                }
            }

            if (resourceResult.interpretedValueCounts && _.isEmpty(resourceResult.interpretedValueCounts)) {
                delete vmResourceResult.interpretedValueCounts;
            }


            vmResourceResult.issuesMap = {};
            var issueBlock;

            var unknownTermIssueSamples = _.map(_.filter(resourceResult.issues, function(i) {
                return i.issue === 'UNKNOWN_TERM';
            }), function(s) {
                return s.relatedData;
            });
            var duplicatedTermIssuesSamples = _.map(_.filter(resourceResult.issues, function(i) {
                return i.issue === 'DUPLICATED_TERM';
            }), function(s) {
                return s.relatedData;
            });
            var emlGbifSchemaIssueSamples = _.map(_.filter(resourceResult.issues, function(i) {
                return i.issue === 'EML_GBIF_SCHEMA';
            }), function(s) {
                return _.get(s, 'samples[0]');
            });

            resourceResult.issues = _.filter(resourceResult.issues, function(i) {
                return i.issue !== 'DUPLICATED_TERM' && i.issue !== 'UNKNOWN_TERM' && i.issue !== 'EML_GBIF_SCHEMA';
            });

            if (unknownTermIssueSamples && unknownTermIssueSamples.length > 0) {
                resourceResult.issues.push({
                    issue: 'UNKNOWN_TERM',
                    issueCategory: 'RESOURCE_STRUCTURE',
                    relatedData: unknownTermIssueSamples

                });
            }

            if (duplicatedTermIssuesSamples && duplicatedTermIssuesSamples.length > 0) {
                resourceResult.issues.push({
                    issue: 'DUPLICATED_TERM',
                    issueCategory: 'RESOURCE_STRUCTURE',
                    relatedData: duplicatedTermIssuesSamples

                });
            }

            if (emlGbifSchemaIssueSamples && emlGbifSchemaIssueSamples.length > 0) {
                resourceResult.issues.push({
                    issue: 'EML_GBIF_SCHEMA',
                    issueCategory: 'RESOURCE_STRUCTURE',
                    samples: emlGbifSchemaIssueSamples

                });
            }

            //
            // var grouped = _.groupBy(resourceResult.issues, function(i){
            //     return (i.issue === "UNKNOWN_TERM" ||  i.issue === "DUPLICATED_TERM") ? i.issue : 'OTHER';
            // })
            // if(grouped["UNKNOWN_TERM"]){
            //
            // }
            angular.forEach(resourceResult.issues, function(value) {
                this[value.issueCategory] = this[value.issueCategory] || [];
                if (value.issue === 'UNKNOWN_TERM' || value.issue === 'DUPLICATED_TERM') {
                    vm.unknownTermMap[value.relatedData] = true;
                }
                value.severity = getIssueSeverity(value.issue);
                vm.validationResults.summary.hasIssues = true;
                vm.validationResults.summary.issueTypesFound[value.issueCategory] = vm.validationResults.summary.issueTypesFound[value.issueCategory] || {};
                vm.validationResults.summary.issueTypesFound[value.issueCategory][value.issue] = vm.remarks[value.issue] || {severity: getIssueSeverity(value.issue), id: value.issue};


                // rewrite sample to exclude redundant information (e.g. evaluationType)

                issueBlock = value; // _.omit(value, 'samples');
 /*                angular.forEach(value.samples, function(sample) {
                    this.samples = this.samples || [];
                    issueSample = {};
                    issueSample.issueData = _.omit(sample, ['evaluationType', 'relatedData']);
                    issueSample.relatedData = sample.relatedData;
                    issueSample.allData = _.assign({}, issueSample.issueData, issueSample.relatedData);
                    this.samples.push(issueSample);
                }, issueBlock); */

                if (issueBlock.related) {
                    issueBlock.sample = _.sortBy(issueBlock.sample, [function(o) {
                        return (_.isArray(o.relatedData)) ? - Object.keys(o.relatedData).length : 0;
                    }

                    ]);
                }
                if (issueBlock.samples && issueBlock.samples.length === 0) {
                    delete issueBlock.samples;
                }

              /*   if (issueBlock.samples && issueBlock.samples.length > 0 && issueBlock.samples[0].issueData && issueBlock.samples[0].relatedData) {
                    issueBlock.headers = Object.keys(issueBlock.samples[0].issueData).concat(Object.keys(issueBlock.samples[0].relatedData));
                } else if (issueBlock.samples && issueBlock.samples.length > 0 && issueBlock.samples[0].issueData) {
                    issueBlock.headers = Object.keys(issueBlock.samples[0].issueData);
                } */

                this[value.issueCategory].push(issueBlock);
            }, vmResourceResult.issuesMap);
            _.each(vmResourceResult.issuesMap, function(val, key) {
                vmResourceResult.issuesMap[key] = sortIssues(val);
            });
            this.push(vmResourceResult);
        }, vm.validationResults.results);

        _.each(vm.validationResults.summary.issueTypesFound, function(val, key) {
            vm.validationResults.summary.issueTypesFound[key] = _.values(sortIssues(val));
        });

        vm.validationResults.summary.issueTypesFoundSorted = _.sortBy(_.map(vm.validationResults.summary.issueTypesFound, function(value, key) {
            return {key: key, issues: value};
        }),
            function(r) {
                switch (r.key) {
                    case 'RESOURCE_STRUCTURE':
                        return 0;
                    case 'RESOURCE_INTEGRITY':
                        return 1;
                    case 'RECORD_STRUCTURE':
                        return 2;
                    case 'METADATA_CONTENT':
                        return 3;
                    case 'OCC_INTERPRETATION_BASED':
                        return 4;
                    case 'CLB_INTERPRETATION_BASED':
                        return 5;
                }
            });


        vm.validationResults.results = _.sortBy(vm.validationResults.results, function(r) {
            switch (r.fileType) {
                case 'META_DESCRIPTOR':
                    return 0;
                case 'METADATA':
                    return 1;
                case 'CORE':
                    return 2;
                case 'EXTENSION':
                    return 3;
            }
        });
    }


    function handleWSError(data, status) {
        delete $sessionStorage.gbifRunningValidatonJob;

        vm.hasError = true;
        switch (status) {
            case 413:
                vm.hasApi413Error = true;
                break;
            case 404:
                vm.hasApi404Error = true;
                break;
            case 400:
                vm.hasApi400Error = true;
                break;
            case 401:
                vm.hasApi401Error = true;
                break;
            case 403:
                vm.hasApi401Error = true;
                break;
            default:
                vm.hasApiCriticalError = true;
        }
    }


/*     function handleFailedJob(data) {
        vm.file = _.get(data, 'file');
        vm.fileSize = !_.isNaN(_.get(data, 'fileSize')) ? (Number(_.get(data, 'fileSize')) / 1000000).toFixed(1) : undefined;
        vm.jobStatus = data.status;
        vm.errorCode = _.get(data, 'result.errorCode');
        vm.errorMessage = _.get(data, 'result.errorMessage');
    } */


    vm.attachTabListener = function() {
        fixedUtil.updateTabs();
    };

    vm.attachMenuListener = function() {
        fixedUtil.updateMenu();
    };
}

module.exports = dataValidatorKeyCtrl;
