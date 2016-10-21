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
        formData.append('format', "TABULAR");
        formData.append('fieldsTerminatedBy', "\\t");

        $http({
            url: devApiUrl + 'data/validation/file',
            method: "POST",
            data: formData,
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).success(function (data, status, headers, config) {
            handleValidationResult(data);
        }).error(function (data, status, headers, config) {
            // handle error things
        });
    };

    //to be reviewed
    function handleValidationResult(data) {
        vm.validationResults = data;

        var issueBlock, issueSample;
        angular.forEach(data.issues, function(value) {
            this[value.issueCategory] = this[value.issueCategory] || [];
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
}

module.exports = dataValidatorCtrl;