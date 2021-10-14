'use strict';

var fixedUtil = require('../../dataset/key/main/submenu');

require('../../../components/fileUpload/fileUpload.directive');
require('./feedback.service');
require('./intro/steps.directive');
var _ = require('lodash');

angular
    .module('portal')
    .controller('dataValidatorCtrl', dataValidatorCtrl);

/** @ngInject */
function dataValidatorCtrl($scope, $timeout, $http, $state, $sessionStorage, User, AUTH_EVENTS, validatorFeedbackService, env, Upload) {
    var vm = this;
    vm.dataApi = env.dataApi;

    vm.$state = $state;
    vm.toggleFeedback = validatorFeedbackService.toggleFeedback;

    vm.resourceToValidate = {};
    // *********** set basic auth for dev purposes
    if (window.location.search) {
        var params = window.location.search.substring(1).split('&');
        var query = {};
        for (var i = 0; i < params.length; i++) {
            var param = params[i].split('=');
            if (param.length === 2) {
                query[param[0]] = param[1];
            }
        }
        if (query.basic) {
            vm.forDevelopmentOnlyAuth = query.basic;
        }
    }


    vm.handleUploadFile = function(params) {
        // start upload
        vm.uploadProcess = Upload.upload({
            url: '/api/validation', // vm.dataApi + 'validation', // '/api/validation',
           // headers: {'Authorization': 'Bearer ' + User.getAuthToken()}, // only for html5
            headers: vm.forDevelopmentOnlyAuth ? {'Authorization': 'Basic ' + vm.forDevelopmentOnlyAuth} : {'Authorization': 'Bearer ' + User.getAuthToken()},
            data: {
                file: params.files
            },
            arrayKey: ''
        });

        vm.uploadProcess.then(function(response) {
            $timeout(function() {
                $state.go('dataValidatorKey', {jobid: response.data.key});
                // vm.state = vm.states.UPLOADED;
                // vm.result = response.data;
            });
        }, function(response) {
            if (response.status === 403) {
                alert('Auth failed, please use ?basic=xxxxxxxxxx for testing :-)');
            }
            $timeout(function() {
                handleFailedJob(response.data);
            });
        }, function(evt) {
            vm.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
    };
/*     vm.handleUploadFile = function(params) {
        var formData = new FormData();
        formData.append('file', params.files[0]);
        vm.jobStatus = 'SUBMITTED';
        $http({
            url: vm.dataApi + 'validation', // 'validator/jobserver/submit',
            method: 'POST',
            data: formData,
            transformRequest: angular.identity,
            headers: {'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + User.getAuthToken()},
            transformResponse: function(response, headersGetter, status) {
                return (status !== 415) ? JSON.parse(response) : {message: response};
            }
        }).success(function(data, status) {
            handleValidationSubmitResponse(data, status);
        }).error(function(data, status) {
            handleWSError(data, status);
        });
    }; */

    /* vm.handleFileUrl = function(params) {
        vm.jobStatus = 'FETCHING';
        var url = vm.dataApi + 'validation/url'; // 'validator/jobserver/submiturl';
        var formData = new FormData();
        formData.append('fileUrl', params.fileUrl);
        $http({url: url, method: 'POST', data: formData, headers: {'Content-Type': 'multipart/form-data', 'Authorization': 'Basic ' + vm.forDevelopmentOnlyAuth}})
            .success(function(data, status) {
                handleValidationSubmitResponse(data, status);
            })
            .error(function(data, status) {
                handleWSError(data, status);
            });
    }; */

    vm.handleFileUrl = function(params) {
        vm.uploadProcess = Upload.upload({
            url: vm.dataApi + 'validation/url', // '/api/validation/url',
           // headers: {'Authorization': 'Bearer ' + User.getAuthToken()}, // only for html5
           headers: vm.forDevelopmentOnlyAuth ? {'Authorization': 'Basic ' + vm.forDevelopmentOnlyAuth} : {'Authorization': 'Bearer ' + User.getAuthToken()},
           data: {
                fileUrl: params.fileUrl
            },
            arrayKey: ''
        });

        vm.uploadProcess.then(function(response) {
            $timeout(function() {
                $state.go('dataValidatorKey', {jobid: response.data.key});
                // vm.state = vm.states.UPLOADED;
                // vm.result = response.data;
            });
        }, function(response) {
            if (response.status === 403) {
                alert('Auth failed, please use ?basic=xxxxxxxxxx for testing :-)');
            }
            $timeout(function() {
                handleFailedJob(response.data);
            });
        }, function(evt) {
            vm.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
    };


if ($sessionStorage.gbifRunningValidatonJob) {
        $state.go('dataValidatorKey', {jobid: $sessionStorage.gbifRunningValidatonJob});
    }


    function handleValidationSubmitResponse(data) {
        if ((data.status !== 'FAILED' ) && data.jobId) {
            vm.jobId = data.jobId;

            $state.go('dataValidatorKey', {jobid: vm.jobId});
        } else if (data.status === 'FAILED') {
            delete $sessionStorage.gbifRunningValidatonJob;
            handleFailedJob(data);
        }
    }


    vm.handleDrop = function(e) {
        vm.handleUploadFile(e.dataTransfer);
    };

    function handleWSError(data, status) {
        vm.hasError = true;
        switch (status) {
            case 415:
                vm.hasApi415Error = true;
                break;
            case 413:
                vm.hasApi413Error = true;
                break;
            case 404:
                vm.hasApi404Error = true;
                break;
            case 400:
                vm.hasApi400Error = true;
                break;
            default:
                vm.hasApiCriticalError = true;
        }
        // vm.hasApiCriticalError = true;
      //  alert("error")
    }

    function handleFailedJob(data) {
        vm.jobStatus = data.status;
        vm.errorCode = _.get(data, 'result.errorCode');
        vm.errorMessage = _.get(data, 'result.errorMessage');
    }


    vm.attachTabListener = function() {
        fixedUtil.updateTabs();
    };

    vm.attachMenuListener = function() {
        fixedUtil.updateMenu();
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

module.exports = dataValidatorCtrl;
