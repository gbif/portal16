'use strict';

var fixedUtil = require('../../dataset/key/main/submenu');

require('../../../components/fileUpload/fileUpload.directive');
require('./feedback.service');
require('./intro/steps.directive');

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

    
    vm.getToken = function() {
        return vm.token ? Promise.resolve() : $http({url: '/api/token', method: 'GET', headers: {'Authorization': 'Bearer ' + User.getAuthToken()}})
        .success(function(data, status) {
            vm.token = data.token;
        })
        .error(function(data, status) {
           handleWSError(data, status);
        });
    };

    vm.handleUploadFile = function(params) {
        // start upload
        
        vm.uploadProcess = vm.getToken().then(function() {
            var conf = {
                url: vm.dataApi + 'validation',
                data: {
                    file: params.files
                },
                arrayKey: ''
            };
            if (vm.token) {
                conf.headers = {'Authorization': 'Bearer ' + vm.token};
            }
            return Upload.upload(conf);
        });

        vm.uploadProcess.then(function(response) {
            $timeout(function() {
                $state.go('dataValidatorKey', {jobid: response.data.key});
            });
        }, function(response) {
            $timeout(function() {
                handleWSError(response.data, response.status);
                // handleFailedJob(response.data);
            });
        }, function(evt) {
            vm.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
    };

/*      vm.handleUploadFile = function(params) {
        var formData = new FormData();
        formData.append('file', params.files[0]);
        vm.jobStatus = 'SUBMITTED';
        $http({
            url: vm.dataApi + 'validation', // 'validator/jobserver/submit',
            method: 'POST',
            data: formData,
            transformRequest: angular.identity,
            headers: {'Content-Type': 'multipart/form-data', 'Authorization': 'Bearer ' + User.getAuthToken()}
        }).success(function(data, status) {
            handleValidationSubmitResponse(data, status);
        }).error(function(data, status) {
            handleWSError(data, status);
        });
    };  */

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
        vm.uploadProcess = vm.getToken().then(function() {
            var conf = {
               url: vm.dataApi + 'validation/url', // '/api/validation/url',               
               data: {
                    fileUrl: params.fileUrl
                },
                arrayKey: ''
            };
            if (vm.token) {
                conf.headers = {'Authorization': 'Bearer ' + vm.token};
            }
            return Upload.upload(conf);
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
                handleWSError(response.data, response.status);
                // handleFailedJob(response.data);
            });
        }, function(evt) {
            vm.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
    };


/* if ($sessionStorage.gbifRunningValidatonJob) {
        $state.go('dataValidatorKey', {jobid: $sessionStorage.gbifRunningValidatonJob});
    } */

/* 
    function handleValidationSubmitResponse(data) {
        if ((data.status !== 'FAILED' ) && data.jobId) {
            vm.jobId = data.jobId;

            $state.go('dataValidatorKey', {jobid: vm.jobId});
        } else if (data.status === 'FAILED') {
            delete $sessionStorage.gbifRunningValidatonJob;
            handleFailedJob(data);
        }
    } */


    vm.handleDrop = function(e) {
        vm.handleUploadFile(e.dataTransfer);
    };

    function handleWSError(data, status) {
        vm.hasError = true;
        if (data && typeof data === 'string') {
            vm.errorMessage = data;
        }
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
