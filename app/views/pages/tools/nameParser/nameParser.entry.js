'use strict';
var env = window.gb.env;

angular
    .module('portal')
    .controller('nameParserCtrl', nameParserCtrl);

/** @ngInject */
function nameParserCtrl($http, $scope, hotkeys, $location) {
    var vm = this;
    vm.state = {};
    vm.pagination = {
        currentPage: 1,
        pageSize: 20
    };
    vm.error;
    vm.locale = gb.locale;
    vm.$location = $location;

    window.onbeforeunload = function(e) {
        if (vm.names && vm.names.length > 0) {
            var dialogText = 'By leaving the page you loose your data.';
            e.returnValue = dialogText;
            return dialogText;
        }
    };

    vm.handleDrop = function(e) {
        var file = e.dataTransfer.files[0];
        parseFile(file);
    };

    $scope.handleFiles = function(files) {
        parseFile(files[0]);
    };

    var isValidFile = function(file) {
        return !!file && (file.type == '' || file.type == 'text/plain' );
    };

    vm.inputList = 'Abies alba Mill.\nGe Nicéville 1895\nStagonospora polyspora M.T. Lucas & Sousa da Câmara 1934\nArthopyrenia hyalospora (Nyl.) R.C. Harris comb. nov';
    vm.loadNames = function() {
        $http.get('/api/tools/nameparser/names').then(function(response) {
            vm.inputList = response.data;
        });
    };
    vm.parse = function(list) {
        var pipeDelimited = list.split('|');
        var newLineDelimited = list.split('\n');

        var entities = (pipeDelimited.length > newLineDelimited.length) ? pipeDelimited : newLineDelimited;
            $http({
            method: 'POST',
            url: env.dataApi + 'parser/name',
            data: JSON.stringify(entities)
            }).then(function(response) {
                vm.names = response.data;
                vm.lookupComplete = true;
            });
    };


    var parseFile = function(file) {
        vm.invalidFileFormat = false;
        if (!isValidFile(file)) {
            vm.invalidFileFormat = true;
            vm.error = 'Invalid file format - the file must be a txt file';
            return;
        }
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function() {
            vm.parse(reader.result);
        };
    };


    vm.generateCsv = function() {
        // eslint-disable-next-line max-len
        var fields = ['scientificName', 'type', 'genusOrAbove', 'specificEpithet', 'infraSpecificEpithet', 'authorship', 'bracketAuthorship', 'parsed', 'authorsParsed', 'canonicalName', 'canonicalNameWithMarker', 'canonicalNameComplete', 'rankMarker'];
        var csvContent = '';

        // write column names
        fields.forEach(function(field, index) {
            csvContent += field;
            if (index < fields.length - 1) {
                csvContent += ',';
            }
        });
        csvContent += '\n';

        // write rows
        vm.names.forEach(function(e) {
            // write row
            if (!e.parsed && vm.exclude) {
                return;
            }
            fields.forEach(function(field, index) {
                csvContent += e[field] ? '"' + e[field] + '"' : '';
                if (index < fields.length - 1) {
                    csvContent += ',';
                }
            });
            csvContent += '\n';
        });
        // add string to href as data uri making it downloadable
        document.getElementById('nameParser_generatedCsv').href = 'data:application/octet-stream,' + encodeURI(csvContent);
        vm.download = true;
    };


    hotkeys.add({
        combo: 'alt+right',
        description: 'Next',
        callback: function() {
            if (vm.pagination.currentPage * vm.pagination.pageSize < vm.names.length) {
                vm.pagination.currentPage += 1;
            }
        }
    });
    hotkeys.add({
        combo: 'alt+left',
        description: 'Previous',
        callback: function() {
            if (vm.pagination.currentPage > 1) {
                vm.pagination.currentPage -= 1;
            }
        }
    });
}

module.exports = nameParserCtrl;
