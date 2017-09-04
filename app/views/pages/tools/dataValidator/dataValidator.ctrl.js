'use strict';
var _ = require('lodash'),
    fixedUtil = require('../../dataset/key/main/submenu');

require('../../../components/fileUpload/fileUpload.directive');


//only available on dev for now
var devApiUrl = '//api.gbif-dev.org/v1/';

angular
    .module('portal')
    .controller('dataValidatorCtrl', dataValidatorCtrl);

/** @ngInject */
function dataValidatorCtrl($http, $window, $stateParams, $timeout) {
    var vm = this;


    vm.resourceToValidate = {};

    vm.issueSampleExpanded = {};
    vm.issuesMap = {};

    vm.handleUploadFile = function(params) {
        var formData = new FormData();
        formData.append('file', params.files[0]);

        $http({
            url: devApiUrl + 'validator/jobserver/submit',
            method: "POST",
            data: formData,
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).success(function (data, status) {
            handleValidationSubmitResponse(data, status);
        }).error(function (data) {
            handleWSError(data);
        });
    };

    vm.handleFileUrl = function(params) {
        var postParams = {params: {}};
        _.merge(postParams.params, params);

        var url = devApiUrl + 'validator/jobserver/submiturl';
        $http.post(url, null, postParams)
            .success(function (data, status) {
                handleValidationSubmitResponse(data, status);
            })
            .error(function (data) {
                handleWSError(data);
            });
    };

    vm.getValidationResults = function(jobid) {

        loadEvaluationCategory();

        $http({
            url: devApiUrl + 'validator/jobserver/status/' + jobid
        }).success(function (data) {
            handleValidationResult(data);
        }).error(function (err) { //data, status, headers, config
            handleWSError(err)
            // TODO handle error things
        });
    };

    if($stateParams.jobid){
        vm.jobid = $stateParams.jobid;
        vm.getValidationResults(vm.jobid)
    };

    function loadEvaluationCategory() {
        $http({
            url: devApiUrl + 'validator/enumeration/simple/EvaluationCategory'
        }).success(function (data) {
            vm.evaluationCategory = data;
        }).error(function () { //data, status, headers, config
            // TODO handle error things
        });
    }

    function handleValidationSubmitResponse(data) {
        //TODO validate that there is a jobId and if not display error message
        $window.location.href = '/tools/data-validator/' + data.jobId;
    }

    function handleValidationResult(responseData) {

        vm.jobId = responseData.jobId;
        vm.jobStatus = responseData.status;

        if(vm.jobStatus === "RUNNING"){
            $timeout(function(){
                $window.location.href = '/tools/data-validator/' + vm.jobId;

            }, 1000)
        } else {

            var data = responseData.result;

            data.results.sort(function(a, b){
                if(a.fileType === "CORE" && b.fileType !== "CORE"){
                    return -1
                } else if(a.fileType !== "CORE" && b.fileType === "CORE"){
                    return 1
                } else {
                    return 0
                };
            })

            vm.extensionCount = 0;

            for(var i=0; i< data.results.length; i++){
                if(data.results[i].fileType === "CORE"){
                    vm.coreDataType = data.results[i].rowType;
                } else if(data.results[i].fileType === "EXTENSION"){
                    vm.extensionCount ++
                }
            }

            vm.validationResults = {
                summary: _.omit(data, 'results'),
                results: []
            };
            vm.validationResults.summary.issueTypesFound = {}
            angular.forEach(data.results, function(resourceResult) {
                var vmResourceResult = _.omit(resourceResult, 'issues');
                //the order of the evaluationCategory is important
                vmResourceResult.issues = _.orderBy(resourceResult.issues, function (value) {return _.indexOf(vm.evaluationCategory, value.issueCategory)});

                //prepare terms frequency
                if(resourceResult.termsFrequency){
                    vmResourceResult.termsFrequency = {};
                    angular.forEach(resourceResult.termsFrequency, function(value, key) {
                        var termFreqData = {};
                        termFreqData.count = value;
                        termFreqData.percentage = Math.round((value/ resourceResult.numberOfLines)*100);
                        this[key] = termFreqData;
                    }, vmResourceResult.termsFrequency);
                }


                vmResourceResult.issuesMap = {};
                var issueBlock, issueSample;
                angular.forEach(resourceResult.issues, function(value) {
                    this[value.issueCategory] = this[value.issueCategory] || [];

                    vm.validationResults.summary.hasIssues = true;
                    vm.validationResults.summary.issueTypesFound[value.issueCategory] = vm.validationResults.summary.issueTypesFound[value.issueCategory] || {};
                    vm.validationResults.summary.issueTypesFound[value.issueCategory][value.issue] = true;
                    //rewrite sample to exclude redundant information (e.g. evaluationType)
                    //TODO to the same thing for issues with non sample
                    issueBlock = _.omit(value, 'sample');
                    angular.forEach(value.sample, function(sample) {
                        this.sample = this.sample || [];
                        issueSample = {};
                        issueSample.issueData = _.omit(sample, ['evaluationType', 'relatedData']);
                        issueSample.relatedData = sample.relatedData;
                        this.sample.push(issueSample);
                    }, issueBlock);

                    this[value.issueCategory].push(issueBlock);
                }, vmResourceResult.issuesMap);

                this.push(vmResourceResult);
            }, vm.validationResults.results);


        }

    }

    function handleWSError(data) {
        vm.hasApiCriticalError = true;
      //  alert("error")
    }


    vm.attachTabListener = function () {
        fixedUtil.updateTabs();
    };

    vm.attachMenuListener = function () {
        fixedUtil.updateMenu();
    };
}

module.exports = dataValidatorCtrl;
