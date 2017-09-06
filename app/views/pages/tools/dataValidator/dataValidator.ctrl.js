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
function dataValidatorCtrl($http, $stateParams, $state, $timeout) {
    var vm = this;
    vm.$state = $state;

    vm.resourceToValidate = {};

    vm.issueSampleExpanded = {};
    vm.issuesMap = {};

    vm.handleUploadFile = function(params) {
        var formData = new FormData();
        formData.append('file', params.files[0]);
        vm.jobStatus = "SUBMITTED";
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
        vm.jobStatus = "FETCHING";
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

        $http.get(
            devApiUrl + 'validator/jobserver/status/' + jobid, {params: {nonse: Math.random()}}

        ).success(function (data) {
            handleValidationSubmitResponse(data);
        }).error(function (err, status, headers) { //data, status, headers, config

            if((err && err.statusCode === 404 )|| status === 404){
                handleValidationSubmitResponse(err)
            } else{

                handleWSError(err)

            }
        });
    };

    if($stateParams.jobid){
        vm.jobid = $stateParams.jobid;
        vm.getValidationResults(vm.jobid)
    };

    function loadEvaluationCategory() {
       return $http({
            url: devApiUrl + 'validator/enumeration/simple/EvaluationCategory'
        }).success(function (data) {
            vm.evaluationCategory = data;
        }).error(function (err) { //data, status, headers, config

            handleWSError(err)

        });
    }

    function handleValidationSubmitResponse(data) {

        vm.jobStatus = data.status;

        if((data.status === "RUNNING" || data.status === "ACCEPTED" || data.status === "NOT_FOUND") && data.jobId){

            vm.jobId = data.jobId;
            $timeout(function(){

                if($state.is('dataValidatorKey')){
                    vm.getValidationResults($stateParams.jobid)
                } else if($state.is('dataValidator')){

                    $state.go("dataValidatorKey", {jobid: vm.jobId});

                }

            }, 1000)
        } else if(data.status === "FAILED"){
            handleFailedJob(data);
        } else if(data.status === "FINISHED"){
            handleValidationResult(data);
        }
        //$window.location.href = '/tools/data-validator/' + data.jobId;
    }

    function handleValidationResult(responseData) {





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

    vm.handleDrop = function (e) {
        vm.handleUploadFile(e.dataTransfer);
    };

    function handleWSError(data) {
        vm.hasApiCriticalError = true;
      //  alert("error")
    }

    function handleFailedJob(data){
        vm.jobStatus = data.status;
    }


    vm.attachTabListener = function () {
        fixedUtil.updateTabs();
    };

    vm.attachMenuListener = function () {
        fixedUtil.updateMenu();
    };
}

module.exports = dataValidatorCtrl;
