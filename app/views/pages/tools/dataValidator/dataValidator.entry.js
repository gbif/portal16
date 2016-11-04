'use strict';
var _ = require('lodash');
require('../../../components/fileUpload/fileUpload.directive');

//only available on dev for now
var devApiUrl = 'http://api.gbif-dev.org/v1/';

angular
    .module('portal')
    .controller('dataValidatorCtrl', dataValidatorCtrl);

/** @ngInject */
function dataValidatorCtrl($http, $scope) {
    var vm = this;

    vm.issueSampleExpanded = {};
    vm.issuesMap = {};

    vm.handleUploadFile = function(params) {
        var formData = new FormData();
        formData.append('file', params.files[0]);

        $http({
            url: devApiUrl + 'validator/validate/file',
            method: "POST",
            data: formData,
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).success(function (data, status, headers, config) {
            handleValidationResult(data);
        }).error(function (data, status, headers, config) {
            handleWSError(data);
        });
    };

    vm.getEvaluationCategory = function(params) {
        $http({
            url: devApiUrl + 'validator/enumeration/simple/EvaluationCategory'
        }).success(function (data, status, headers, config) {
            vm.evaluationCategory = data;
        }).error(function (data, status, headers, config) {
            // handle error things
        });
    }(); //run now

    //to be reviewed
    function handleValidationResult(data) {

        vm.validationResults = data;
        //the order of the evaluationCategory is important
        //FIXME we should not use results[0] but iterate
        var resourceResult = vm.validationResults.results[0];
        vm.validationResults.issues = _.orderBy(resourceResult.issues, function (value) {return _.indexOf(vm.evaluationCategory, value.issueCategory)});

        //prepare terms frequency
        vm.termsFrequency = {};
        var termFreqData;
        angular.forEach(resourceResult.termsFrequency, function(value, key) {
            termFreqData = {};
            termFreqData.count = value;
            termFreqData.percentage = Math.round((value/ resourceResult.numberOfLines)*100);
            this[key] = termFreqData;
        }, vm.termsFrequency);

        var issueBlock, issueSample;
        angular.forEach(vm.validationResults.issues, function(value) {
            this[value.issueCategory] = this[value.issueCategory] || [];

            //rewrite sample to exclude redundant information (e.g. evaluationType)
            issueBlock = _.omit(value, 'sample');
            angular.forEach(value.sample, function(sample) {
                this.sample = this.sample || [];
                issueSample = {};
                issueSample.issueData = _.omit(sample, ['evaluationType', 'relatedData']);
                issueSample.relatedData = sample.relatedData;
                this.sample.push(issueSample);
            }, issueBlock);

            this[value.issueCategory].push(issueBlock);
        }, vm.issuesMap);
    }

    function handleWSError(data) {
        vm.validationResults = data;
    }
}

module.exports = dataValidatorCtrl;