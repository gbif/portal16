'use strict';

var fixedUtil = require('../../dataset/key/main/submenu');

require('../../../components/fileUpload/fileUpload.directive');
require('./feedback.service');
var _ = require('lodash');

angular
    .module('portal')
    .controller('dataValidatorCtrl', dataValidatorCtrl);

/** @ngInject */
function dataValidatorCtrl($scope, $http, $state, $sessionStorage, User, AUTH_EVENTS, validatorFeedbackService, env) {
    var vm = this;
    vm.dataApi = env.dataApi;

    vm.$state = $state;
    vm.toggleFeedback = validatorFeedbackService.toggleFeedback;

    vm.resourceToValidate = {};
    vm.handleUploadFile = function(params) {
        var formData = new FormData();
        formData.append('file', params.files[0]);
        vm.jobStatus = 'SUBMITTED';
        $http({
            url: vm.dataApi + 'validator/jobserver/submit',
            method: 'POST',
            data: formData,
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined},
            transformResponse: function(response, headersGetter, status) {
                return (status !== 415) ? JSON.parse(response) : {message: response};
            }
        }).success(function(data, status) {
            handleValidationSubmitResponse(data, status);
        }).error(function(data, status) {
            handleWSError(data, status);
        });
    };

    vm.handleFileUrl = function(params) {
        vm.jobStatus = 'FETCHING';
        var url = vm.dataApi + 'validator/jobserver/submiturl';
        $http({url: url, params: params, method: 'POST'})
            .success(function(data, status) {
                handleValidationSubmitResponse(data, status);
            })
            .error(function(data, status) {
                handleWSError(data, status);
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
