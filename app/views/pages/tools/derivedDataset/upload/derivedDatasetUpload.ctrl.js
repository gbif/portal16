'use strict';

var _ = require('lodash');

require('../../dataRepository/markdownEditor.directive');
require('../derivedDataset.resource');
var Converter = require('csvtojson').Converter;

angular
    .module('portal')
    .controller('derivedDatasetUploadCtrl', derivedDatasetUploadCtrl);

/** @ngInject */
function derivedDatasetUploadCtrl(
    $scope,
    $state,
    $window,
    User,
    $timeout,
    $http,
    $stateParams,
    DerivedDatasetDatasets,
    $translate
) {
    var vm = this;
    vm.isEdit = !!$stateParams.record;
    vm.states = {
        FILL_FORM: 0,
        UPLOADING: 1,
        UPLOADED: 2,
        FAILED_UPLOAD: 3
    };
    vm.state = vm.states.FILL_FORM;
    function getDerivedDatasetDatasets(doi) {
        var splitDoi = doi.split('/');
        return DerivedDatasetDatasets.query(
            {prefix: splitDoi[0], suffix: splitDoi[1]},
            function (res) {
                return _.get(res, 'results[0]')
                    ? res.results.map(function (dataset) {
                          return {
                              key: dataset.datasetDOI || dataset.datasetKey,
                              val: dataset.numberRecords
                          };
                      })
                    : [{}];
            },
            function (err) {
                vm.errorMsg = err.message;
                // console.log(err);
            }
        );
    }
    vm.initForm = function () {
        vm.form = $stateParams.record
            ? _.omit($stateParams.record, ['relatedDatasets', 'registrationDate'])
            : {};
        if (_.get($stateParams, 'record.registrationDate')) {
            vm.form.registrationDate = new Date($stateParams.record.registrationDate);
        }
        vm.relatedDatasets = [{}];
        vm.relatedDatasetsFromFile = [];
        if ($stateParams.record) {
            vm.derivedDatasetDatasets = getDerivedDatasetDatasets(
                $stateParams.record.doi
            );
            vm.derivedDatasetDatasets.$promise.then(function (res) {
                if (_.get(res, 'results[0]')) {
                    vm.relatedDatasets = res.results.map(function (dataset) {
                        return {
                            key: dataset.datasetDOI || dataset.datasetKey,
                            val: dataset.numberRecords
                        };
                    });
                }
            });
        }


        vm.state = vm.states.FILL_FORM;
        vm.result = vm.errorMsg = undefined;
    };
    vm.initForm();
    vm.attachment;
    $scope.$watch(angular.bind(this, function() {
        return this.attachment;
    }), function(newVal, oldVal) {
        if (newVal) {
        vm.parseFile(newVal);
        } else {
            vm.relatedDatasetsFromFile = [];
        }
    });

    vm.addItemToArray = function (items) {
        items.push({});
    };
    vm.insertItemInArray = function (index, items) {
        items.splice(index, 0, {});
    };

    vm.removeFromArray = function (item, items) {
        _.remove(items, function (n) {
            return n == item;
        });
    };

    vm.updateDescription = function (description) {
        vm.form.description = description;
    };

    vm.countNonEmptyItems = function (items) {
        return _.filter(items, function (e) {
            return e.val;
        }).length;
    };

    vm.reload = function () {
        $state.reload();
    };
    var isValidFile = function(file) {
        return !!file && (file.type == '' || file.type == 'text/csv' || file.type == 'text/plain' || file.name.indexOf('.csv') > 1);
    };
    vm.parseFile = function(file) {
        vm.invalidFileFormat = false;
        if (!isValidFile(file)) {
            vm.invalidFileFormat = true;
            vm.errorMsg = 'tools.derivedDataset.invalidFileFormat'; // 'Invalid file format - the file must be a csv file';
            return;
        }
        var reader = new FileReader();
        reader.onload = function() {
            var converter = new Converter({
                noheader: true,
                delimiter: [',', ';', '$', '|', '\t']
            });
            var csvString = reader.result;
            vm.error = undefined;
            converter.fromString(csvString, function(err, result) {
                if (_.get(err, 'message')) {
                    vm.errorMsg = err.message;
                } else if (result.length == 0) {
                    vm.errorMsg = 'tools.derivedDataset.emptyFile'; // 'There are no rows in the data.';
                } else if (result.length > 6000) {
                    vm.errorMsg = 'tools.derivedDataset.tooManyRows'; //'<span>Too many rows (maximum 6.000) - try using <a href="https://techdocs.gbif.org/en/openapi/v1/registry#/Derived%20datasets" target="_blank">our APIs</a> instead</span>';
                } else {
                vm.relatedDatasetsFromFile = result.map(function (elm) {
                    return {key: elm.field1, val: elm.field2};
                });
                }
                $scope.$apply();
            });
        };
        reader.readAsText(file);
    };

    vm.upload = function () {
        // check that the upload isn't already started
        if (vm.state == vm.states.UPLOADING) return; // to avoid duplicate uploads
        // extract data to send
        var data = vm.form;
        var relatedDatasets;
            if (
                vm.relatedDatasetsFromFile.length === 0 &&
                _.get(vm.relatedDatasets, '[0].key') &&
                _.get(vm.relatedDatasets, '[0].val')
            ) {
                relatedDatasets = vm.relatedDatasets;
            } else {
                relatedDatasets = vm.relatedDatasetsFromFile;
            }
            data.relatedDatasets = relatedDatasets
                    .filter(function (dataset) {
                        return _.get(dataset, 'key') && _.get(dataset, 'val') && !isNaN(dataset.val);
                    })
                    .reduce(function (acc, cur) {
                        acc[cur.key] = cur.val;
                        return acc;
                    }, {});

        // reset upload info
        vm.state = vm.states.UPLOADING;
        vm.errorMsg = undefined;
        vm.result = undefined;

        // start upload
        $http({
            method: vm.form.doi ? 'put' : 'post',
            data: data,
            url: vm.form.doi ? '/api/derived-dataset/' + encodeURIComponent(vm.form.doi) : '/api/derived-dataset',
            headers: {Authorization: 'Bearer ' + User.getAuthToken()}
        }).then(
            function successCallback(response) {
                $timeout(function () {
                    vm.state = vm.states.UPLOADED;
                    var doi = vm.form.doi || response.data.doi;
                    var splttedDoi = doi.split('/');
                    vm.result = {prefix: splttedDoi[0], suffix: splttedDoi[1]};
                });
            },
            function errorCallback(response) {
                $timeout(function () {
                    vm.state = vm.states.FAILED_UPLOAD;
                    if (response.status > 0) {
                        vm.errorMsg =
                            response.data.code + ': ' + response.data.message;
                    } else {
                        vm.errorMsg = 'Unknown error occurred';
                    }
                });
            }
        );

        $window.scrollTo(0, 0);
    };
}

module.exports = derivedDatasetUploadCtrl;
