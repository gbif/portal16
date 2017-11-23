'use strict';

var _ = require('lodash');

require('../markdownEditor.directive');

angular
    .module('portal')
    .controller('dataRepositoryUploadCtrl', dataRepositoryUploadCtrl);

/** @ngInject */
function dataRepositoryUploadCtrl($state, $window, User, Upload, $timeout) {
    var vm = this;
    vm.config = {license: ['CC0_1_0', 'CC_BY_4_0', 'CC_BY_NC_4_0']};
    vm.orcidPattern = /^(https?:\/\/orcid.org\/)?(([0-9]{4}-){3}([0-9]{3}[0-9X]))$/;
    vm.states = {
        FILL_FORM: 0,
        UPLOADING: 1,
        UPLOADED: 2,
        FAILED_UPLOAD: 3
    };
    vm.state = vm.states.FILL_FORM;

    vm.initForm = function () {
        vm.form = {
            creators: [{}],
            license: vm.config.license[0]
        };
        vm.fileUrls = [{}];
        vm.files = [];
        vm.state = vm.states.FILL_FORM;
        vm.result = vm.errorMsg = undefined;
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

    vm.getCitationName = function (name) {
        name = name ? name + '' : '';
        name = name.replace(/\s\s+/g, ' ').trim();
        var parts = name.split(' ');
        var n = parts.pop() + ' ';
        for (var i = 0; i < parts.length; i++) {
            n += parts[i][0].toUpperCase() + ' ';
        }
        return n.trim();
    };

    vm.upload = function () {
        //check that the upload isn't already started
        if (vm.state == vm.states.UPLOADING) return;//to avoid duplicate uploads

        //extract data to send
        var data_package = vm.form;
        data_package.creators = data_package.creators.map(function(creator){
            return {
                name: creator.name,
                identifier: creator.identifier,
                identifierScheme: 'ORCID',
                affiliation: creator.affiliation ? [creator.affiliation] : undefined
            }
        });
        var fileUrls = _.map(vm.fileUrls, function (e) {
            return e.val;
        });

        //reset upload info
        vm.state = vm.states.UPLOADING;
        vm.errorMsg = undefined;
        vm.result = undefined;

        //start upload
        vm.uploadProcess = Upload.upload({
            //url: 'http://localhost:3002/upload',
            url: 'http://api.gbif-dev.org/v1/data_packages/',
            headers: {'Authorization': 'Bearer ' + User.getAuthToken()}, // only for html5
            data: {
                dataPackage: JSON.stringify(data_package),
                file: vm.files,
                fileUrl: fileUrls,
                identifiersFileUrl: vm.relatedIdentifiersUrl,
                identifiersFile: vm.relatedIdentifiersFile
            },
            arrayKey: ''
        });

        $window.scrollTo(0, 0);
        vm.uploadProcess.then(function (response) {
            $timeout(function () {
                vm.state = vm.states.UPLOADED;
                vm.result = response.data;
            });
        }, function (response) {
            $timeout(function () {
                vm.state = vm.states.FAILED_UPLOAD;
                if (response.status > 0) {
                    vm.errorMsg = response.data.code + ': ' + response.data.message;
                } else {
                    vm.errorMsg = 'Unknown error occurred';
                }
            });
        }, function (evt) {
            vm.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });
    };

    //Load the current user and use to prefill the first creator
    var activeUser = User.loadActiveUser();
    if (activeUser) {
        activeUser.then(function (currentUser) {
            vm.profile = currentUser.data;
            vm.form.creators[0].name = vm.form.creators[0].name || vm.profile.firstName + ' ' + vm.profile.lastName;
        });
    }
}

module.exports = dataRepositoryUploadCtrl;