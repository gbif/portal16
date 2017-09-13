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
function dataValidatorCtrl($http, $stateParams, $state, $timeout, DwcExtension) {
    var vm = this;
    vm.$state = $state;

    vm.resourceToValidate = {};

    vm.issueSampleExpanded = {};
    vm.issuesMap = {};

    vm.dwcextensions = DwcExtension.get();

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
        }).error(function (data, status) {
            handleWSError(data, status);
        });
    };

    vm.handleFileUrl = function(params) {

        vm.jobStatus = "FETCHING";
        var url = devApiUrl + 'validator/jobserver/submiturl';
        $http({url: url, params: params, method : "POST"})
            .success(function (data, status) {
                handleValidationSubmitResponse(data, status);
            })
            .error(function (data, status, headers) {
                handleWSError(data, status);
            });
    };

    vm.getValidationResults = function(jobid) {

        $http.get(
            devApiUrl + 'validator/jobserver/status/' + jobid, {params: {nonse: Math.random()}}

        ).success(function (data) {
            handleValidationSubmitResponse(data);
        }).error(function (err, status, headers) { //data, status, headers, config

            if((err && err.statusCode === 404 )|| status === 404){
                handleValidationSubmitResponse(err)
            } else{

                handleWSError(err, status)

            }
        });
    };

    if($stateParams.jobid){
        vm.jobid = $stateParams.jobid;
        loadEvaluationCategory().then(function(){
            vm.getValidationResults(vm.jobid)

        })

    };

    function loadEvaluationCategory() {
       return $http({
            url: devApiUrl + 'validator/enumeration/simple/EvaluationCategory'
        }).success(function (data) {
            vm.evaluationCategory = data;
        }).error(function (err, status) { //data, status, headers, config

            handleWSError(err, status)

        });
    }
    vm.retries404 = 5;
    function handleValidationSubmitResponse(data) {

        vm.jobStatus = data.status;

        if((data.status === "RUNNING"  || data.status === "ACCEPTED" || data.status === "NOT_FOUND") && data.jobId){
            /* currently the validator webservice may return 404 and then after a few attempts it will return 200
                We give it 5 attempts before throwing 404

             */
            vm.jobId = data.jobId;
            if(data.status === "NOT_FOUND"){
                vm.retries404 --;
            }
            $timeout(function(){

                if($state.is('dataValidatorKey')){

                    if(data.status === "NOT_FOUND" && vm.retries404 < 1){
                        handleWSError(data, 404)
                    } else {

                        // pretend the job is running if we haven´t reached 404 retry limit
                        if(data.status === "NOT_FOUND" && vm.retries404 > 0){
                            vm.jobStatus = "CONTACTING_SERVER";
                        }
                        if(data.status === "RUNNING" && data.result){
                            handleValidationResult(data);
                        }
                        vm.getValidationResults($stateParams.jobid)

                    };

                } else if($state.is('dataValidator')){

                    $state.go("dataValidatorKey", {jobid: vm.jobId});

                }

            }, 1000)
        } else if(data.status === "FAILED"){
            handleFailedJob(data);
        } else if(data.status === "FINISHED"){
            handleValidationResult(data);
            console.log(vm.validationResults.summary)
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
            vm.validationResults.summary.issueTypesFound = {};
             vm.unknownTermMap = {};

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
                    if(value.issue === "UNKNOWN_TERM"){
                        vm.unknownTermMap[value.relatedData] = true;
                    };
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

    function handleWSError(data, status) {

        vm.hasError = true;
        switch(status) {
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
        //vm.hasApiCriticalError = true;
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
