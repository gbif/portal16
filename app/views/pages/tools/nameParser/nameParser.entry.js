'use strict';

var async = require('async');

// require('./droppable.directive');

var Converter = require("csvtojson").Converter;

angular
    .module('portal')
    .controller('nameParserCtrl', nameParserCtrl);

/** @ngInject */
function nameParserCtrl($http, $scope, hotkeys, SpeciesMatch, Species, constantKeys, suggestEndpoints, $timeout) {
    var vm = this;
    vm.species = undefined;
    vm.state = {};
    vm.pagination = {
        currentPage: 1,
        pageSize: 20
    };
    vm.itemToEdit = undefined;
    vm.error;

    window.onbeforeunload = function(e) {
        if (vm.species && vm.species.length > 0) {
            var dialogText = 'By leaving the page you loose your data.';
            e.returnValue = dialogText;
            return dialogText;
        }
    };

    vm.handleDrop = function (e) {
        var file = e.dataTransfer.files[0];
        parseFile(file);
    };

    $scope.handleFiles = function (files) {
        parseFile(files[0]);
    };

    var isValidFile = function (file) {
        return !!file && (file.type == '' || file.type == 'text/csv' || file.type == 'text/plain' || file.name.indexOf('.csv') > 1);
    };

    vm.inputList =  "Abies alba Mill.\nGe Nicéville 1895\nStagonospora polyspora M.T. Lucas & Sousa da Câmara 1934\nArthopyrenia hyalospora (Nyl.) R.C. Harris comb. nov";

    vm.parse = function(list){
        var entities = list.split('\n');
            console.log(JSON.stringify(entities));
            $http({
            method: 'POST',
            url: 'http://api.gbif.org/v1/parser/name',
            data: JSON.stringify(entities)
            }).then(function(response){
                vm.names = response.data;
                vm.lookupComplete = true;
                console.log(response.data)
            })



    };



    var parseFile = function (file) {
        vm.invalidFileFormat = false;
        if (!isValidFile(file)) {
            vm.invalidFileFormat = true;
            vm.error = 'Invalid file format - the file must be a csv file and all rows must have a scientificName column';
            return;
        }
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function () {

            console.log(reader.result)
        };

    };


    vm.defaultKingdom = undefined;
    vm.setDefaultKingdom = function (kingdom) {
        if (vm.defaultKingdom == kingdom) {
            vm.defaultKingdom = undefined
        }
        else {
            vm.defaultKingdom = kingdom;
        }
    };

    vm.normalizeAll = function () {
        vm.pagination.currentPage = 1;
        vm.processing = true;
        lookupNames();
    };

    function lookupName(item, callback) {
        var query = {
            verbose: true,
            name: item.originalName,
            kingdom: item.preferedKingdom || vm.defaultKingdom
        };
        SpeciesMatch.query(query, function (data) {
            item.match = data;
            vm.setItem(item, data);
            callback();
        }, function () {
            callback('match went wrong');
        });
    }

    function lookupNames() {
        async.eachLimit(vm.species, 10, lookupName, function (err) {
            if (err) {
                //TODO inform the user that not everything could be matched
            } else {
                vm.lookupComplete = true;
            }
        });
    }




    vm.getSuggestions = function (val) {
        return $http.get(suggestEndpoints.taxon, {
            params: {
                q: val,
                datasetKey: constantKeys.dataset.backbone,
                limit: 10
            }
        }).then(function (response) {
            return response.data;
        });
    };



    vm.generateCsv = function () {
        var fields = ['scientificName', 'type', 'genusOrAbove', 'specificEpithet', 'infraSpecificEpithet', 'authorship', 'bracketAuthorship', 'parsed', 'authorsParsed', 'canonicalName', 'canonicalNameWithMarker', 'canonicalNameComplete', 'rankMarker'];
        var csvContent = '';

        //write column names
        fields.forEach(function (field, index) {
            csvContent += field;
            if (index < fields.length - 1) {
                csvContent += ',';
            }
        });
        csvContent += '\n';

        //write rows
        vm.names.forEach(function (e) {
            //write row
            if (!e.parsed && vm.exclude) {
                return;
            }
            fields.forEach(function (field, index) {
                csvContent += e[field] ? '"' + e[field] + '"' : '';
                if (index < fields.length - 1) {
                    csvContent += ',';
                }
            });
            csvContent += '\n';
        });
        //add string to href as data uri making it downloadable
        document.getElementById('nameParser_generatedCsv').href = 'data:application/octet-stream,' + encodeURI(csvContent);
        vm.download = true;
    };

    vm.getMatchTypeClass = function (matchType) {
        if (matchType == 'FUZZY') {
            return 'badge badge--warning';
        }
        if (matchType == 'NONE') {
            return 'badge badge--error';
        }
        if (matchType == 'HIGHERRANK') {
            return 'badge badge--warning';
        }
        if (matchType == 'EXACT') {
            return 'badge badge--approved';
        }
        if (matchType == 'EDITED') {
            return 'badge badge--info';
        }
    };

    vm.getStatusClass = function (status) {
        if (status == ['ACCEPTED']) {
            return '';
        }
        return 'badge badge--warning';
    };

    hotkeys.add({
        combo: 'alt+right',
        description: 'Next',
        callback: function () {
            if (vm.pagination.currentPage * vm.pagination.pageSize < vm.species.length) {
                vm.pagination.currentPage += 1;
            }
        }
    });
    hotkeys.add({
        combo: 'alt+left',
        description: 'Previous',
        callback: function () {
            if (vm.pagination.currentPage > 1) {
                vm.pagination.currentPage -= 1;
            }
        }
    });

    hotkeys.add({
        combo: 'esc',
        description: 'close',
        allowIn: ['INPUT'],
        callback: function () {
            vm.itemToEdit = undefined;
        }
    });


}

module.exports = nameParserCtrl;
