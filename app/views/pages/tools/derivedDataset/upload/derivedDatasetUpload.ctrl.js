'use strict';

var _ = require('lodash');

require('../../dataRepository/markdownEditor.directive');
require('../derivedDataset.resource');

angular
    .module('portal')
    .controller('derivedDatasetUploadCtrl', derivedDatasetUploadCtrl);

/** @ngInject */
function derivedDatasetUploadCtrl(
    $state,
    $window,
    User,
    Upload,
    $timeout,
    $http,
    $stateParams,
    env,
    DerivedDatasetDatasets
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
                console.log(res);
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
                console.log(err);
            }
        );
    }
    vm.initForm = function () {
        vm.form = $stateParams.record
            ? _.omit($stateParams.record, 'relatedDatasets')
            : {};
        vm.relatedDatasets = [{}];
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

        // vm.files = [];
        vm.state = vm.states.FILL_FORM;
        vm.result = vm.errorMsg = undefined;

        console.log(vm.relatedDatasets);
    };
    vm.initForm();

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

    vm.upload = function () {
        // check that the upload isn't already started
        if (vm.state == vm.states.UPLOADING) return; // to avoid duplicate uploads

        // extract data to send
        var data = vm.form;
        if (
            _.get(vm.relatedDatasets, '[0].key') &&
            _.get(vm.relatedDatasets, '[0].val')
        ) {
            data.relatedDatasets = vm.relatedDatasets
                .filter(function (dataset) {
                    return _.get(dataset, 'key') && _.get(dataset, 'val');
                })
                .reduce(function (acc, cur) {
                    acc[cur.key] = cur.val;
                    return acc;
                }, {});
        }

        console.log(data);
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
        /*
         vm.uploadProcess = Upload.upload({
            url: env.dataApi + 'derivedDataset/',
            headers: {'Authorization': 'Bearer ' + User.getAuthToken()}, // only for html5
            data: {
                dataPackage: JSON.stringify(dataPackage),
                file: vm.files,
                fileUrl: fileUrls,
                identifiersFileUrl: vm.relatedIdentifiersUrl,
                identifiersFile: vm.relatedIdentifiersFile
            },
            arrayKey: ''
        });

        $window.scrollTo(0, 0);
        vm.uploadProcess.then(function(response) {
            $timeout(function() {
                vm.state = vm.states.UPLOADED;
                vm.result = response.data;
            });
        }, function(response) {
            $timeout(function() {
                vm.state = vm.states.FAILED_UPLOAD;
                if (response.status > 0) {
                    vm.errorMsg = response.data.code + ': ' + response.data.message;
                } else {
                    vm.errorMsg = 'Unknown error occurred';
                }
            });
        }, function(evt) {
            vm.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        }); */
    };

    // Load the current user and use to prefill the first creator
}

module.exports = derivedDatasetUploadCtrl;
