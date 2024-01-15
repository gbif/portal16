'use strict';

var async = require('async');
var Converter = require('csvtojson').Converter;
var _ = require('lodash');
var pLimit = require('p-limit');

var Promise = require('bluebird'); //.getNewLibraryCopy();


angular
    .module('portal')
    .controller('sequenceMatchingCtrl', sequenceMatchingCtrl);

/** @ngInject */
function sequenceMatchingCtrl($http, $scope, hotkeys, $location) {
    var vm = this;
    vm.species = undefined;
    var MAX_ERRORS = 25;
    var retries = 3;
    var erroredItems = {};
    vm.state = {};
    vm.pagination = {
        currentPage: 1,
        pageSize: 20
    };
    vm.itemToEdit = undefined;
    vm.error;
    vm.$location = $location;
    vm.thresholds = {
        'ITS': 99,
        'COI': 99,
        '16S': 99,
        '18S': 99,
        '12S': 99
    };
    vm.selectedMarker = 'COI';
    vm.matchThreshold = vm.thresholds[vm.selectedMarker];

    $scope.$watch(function () {
        return vm.selectedMarker;
    }, function (newMarker) {
        vm.matchThreshold = vm.thresholds[newMarker];
    });
    window.onbeforeunload = function (e) {
        if (!vm.error && vm.species && vm.species.length > 0) {
            var dialogText = 'By leaving the page you loose your data.';
            e.returnValue = dialogText;
            return dialogText;
        }
    };
    vm.loadTestData = function () {
        if (vm.selectedMarker === 'ITS') {
            vm.inputList =
                '> 1 Unknown fungus\n' +
                'ATTACTCATCCAAATCCTTTGGATGGACTTGAGCTTGCATTAGCTGGCTTGAAATGAATTGGGTAAACATCTACCATGTCTATCGTCATATTTATTTGCGATATTCTAACTGGTAGTGAGTAGTCCCTTAATAATTTTTAA\n\n' +
                '> 2 Cortinarius sp.\n' +
                'CCTGATAAGTTGCTGCTGGTTCTCTAGGGAGCATGTGCACGCTTGTCATCTTTATATCTTCACCTGTGCACCTTTTGTAGACCTGAATATCTTTCTGAATGCTTTTTTTATTTTAGCACTCAGGATATGGAATTGGCTTTGATGTCTCTTCTTATATTTTCAGGTCTATGTTTCTTCATATACCCTAATGTATGTTATAGAATGT' +
                'CATTTAATGGGCTTTTTATGCCTTTAAATCTATTACAACTTTCAGCAACGGATCTCTTGGCTCTCGCATCGATGAAGAACGCAGCGAAATGCGATAAGTAATGTGAATTGCAGAATTCAGTGAATCATCGAATCTTTGAACGCACCTTGCGCTCCTTGGTATTCCGAGGAGCATGCCTGTTTGAGTGTCATTAATATTATCAACCTCTTTGGTTGGATTTGGGTTTACTGGCCTTGTTGAGGTCAGCTCTCCTTAAATGCATTAGCAGACAACATTTTGTCAACCGTTCATTGGTGTGATAATTATCTACGCTATTGATCGTGAAGGCAGGGTTCAGCTTCTAACAGTCCATTGGCTTGGACAAATTTTATTAATGTGACCTCAAATCAGGTAGGACTACCCGCTGAACTTAAGCA\n\n' +
                '> 3 Entoloma sp.\n' +
                'CATTATTGAATAAGCTTGGTTTCAGATTGTTGCTGGTTCTGCGGGACATGTGCACGTCTGTTCCATTTTTGTTACCACCTGTGCACTTTGTGTAGATCTGAATAACTCTCGAGGCAAACCTCGGTCTTCAAGACATTGCTGGGCATTTGAGATGTACGGCTTTGTCATTATATATTCAGATCTATGTCTTACTACACTACACAATAACAAGTATCTGAAGTTGGTTGCACCTATAAAGATATATTATAACTTTCAACAACGGATCTCTTGGCTCTCGCATCGATGAAGAACGCAGCGAAATGCGATAAGTAATGTGAATTGCAGAATTCAGTGAATCATCGAATCTTTGAACGCACCTTGCGCTCCTTGGTATTCCGAGGAGCATGCCTGTTTGAGTGTCATGAAATCCCTCATCCTTTCGAGCTTTTATTATTAAGCTTGTCAGGCTTTGGATTCTGGGAGTTTGCTGGCTTTATCGAGTCAGCTCTTCTTAAATGTATTAGCAAGATCATCGCTAAATCATCTTTGATATGATAATTATCTATATCAATAAATGAGACCTAAGCGGATTCCATTTCGGAAAACAGATCGAGCTTTACAATCGTCTCAGGACAATTTGAATCATTGACCTCAAATCAG';
        } else if (vm.selectedMarker === 'COI') {
            vm.inputList =
                '>c7bfed2af6b13acb45eb7692062a2245b3fa5112\n' +
                'ATTGTCAGCAGGAATCGCACATGGAGGAGCATCAGTTGATCTGGCTATTTTTTCATTACACCTAGCAGGAATTTCATCAATTTTGGGGGCAGTAAATTTTATTACAACAGTAATTAATATGCGATCAACAGGGATTACTCTTGATCGAATACCTCTATTTGTATGATCAGTTGTTATTACTGCAATTCTTTTATTATTATCCCTC\n' +
                '>5c465b8b545600c7eda02473be74e0d1b57f39fd\n' +
                'ATTATCTTCATATTTATTTCATTCATCACCATCTGTTGATATTGCAATTTTTTCTCTTCATATAACAGGAATTTCTTCTATTATTGGATCTTTAAATTTTATTGTTACAATTATATTAATAAAAAATTATTCTTTAAGTTATGATCAAATTAATTTATTTTCATGATCAGTTTGTATTACTGTAATTTTATTAATATTATCTTTA\n' +
                '>6710bb2567be9253b3e723a8787dd4835beddd61\n' +
                'ACTTTCTGCTAGTATTGCACATGGAGGAGCTTCTGTTGATTTAGCTATTTTTTCCCTTCATTTAGCTGGAATATCATCAATTTTAGGGGCTGTAAATTTTATTACTACAGTAATTAATATACGATCTAATGGAATTTCTTATGATCGTATACCTTTATTTGTATGATCAGTAGTAATTACTGCTTTATTATTACTTTTATCATTA\n' +
                '>16d5df0f1e7fd0b46a2e94108ece90c036f87e3f\n' +
                'CTTATCAGCCAGTATTGCCCATACAGGAGCTTCTGTAGACTTAGCTATTTTTTCTTTACATTTAGCCGGAATTTCTTCTATTTTAGGAGCTGTAAATTTTATTACAACTACAATTAATATACGATCAAGAGGAATTACATTAGATCGAATACCTTTATTTGTTTGATCTGTTGTCATTACTGCAATTTTATTATTGCTTTCTCTT\n' +
                '>c5e12cc67306e65864499750d51b19babdff0fba\n' +
                'TCTTTCTTCAGGAATTGCTCATGGTGGTGCATCAGTAGATTTAGCTATTTTTTCTCTTCATTTAGCAGGAATTTCCTCTATTCTAGGAGCAGTAAACTTCATCACAACCGTGATTAATATACGATCAACAGGAATTACATTTGATCGAATACCTCTATTTGTTTGATCTGTGGTAATTACAGCTATCTTATTGTTACTATCTTTA\n' +
                '>d5050033bfc25a1af1b18e6e5d63b4b2d31711c1\n' +
                'ATTGTCAGCAGGAATCGCGCATGGAGGAGCATCAGTTGATCTGGCTATTTTTTCATTACACCTAGCAGGAATTTCATCAATTTTGGGGGCAGTAAATTTTATTACAACAGTAATTAATATGCGATCAACAGGGATTACTCTTGATCGAATACCTCTATTTGTATGATCAGTTGTTATTACTGCAATTCTTTTATTATTATCCCTC\n' +
                '>87b84f17dc0528473a63af68c5da4ed4ddf5ee83\n' +
                'TCTATCCTCAATTATAGGTCATAATTCACCATCAGTAGATTTAGGAATTTTCTCTATTCATATTGCAGGTGTATCATCAATTATAGGATCAATTAATTTTATTGTAACAATTTTAAATATACATACAAAAACTCATTCATTAAACTTTTTACCATTATTTTCATGATCAGTTCTAGTTACAGCAATTCTCCTTTTATTATCATTA\n' +
                '>a5bc3bae939c439294d7965e19de082c06493ea0\n' +
                'TCTTTCTGCTAGTATTGCACATGGAGGAGCTTCTGTTGATTTAGCTATTTTTTCTCTTCATTTAGCAGGAATATCTTCAATTTTAGGGGCAGTAAATTTTATTACAACAGTAATTAATATACGTTCTAGTGGACTTACTTATGATCGAATACCTTTATTTGTATGATCAGTAGTAATTACAGCTTTATTATTACTTCTATCATTA';
        } else if (vm.selectedMarker === '16S') {
            vm.inputList =
                '>SMHI:BalticPicoplankton:16S21:ASV:128d54338be697bb8d8cf94f4fe84034\n' +
                'TGGGGAATATTGGACAATGGAGGCAACTCTGATCCAGCAATGCCGCGTGTGTGATGAAGGCCCTAGGGTTGTAAAGCACTTTCAACGGTGAAGATGATGACGGTAGCCGTAGAAGAAGCCCCGGCTAACTTCGTGCCAGCAGCCGCGGTAATACGAAGGGGGCGAGCGTTATTCGGAATTATTGGGCGTAAAGGGCTCGCAGGCTGCTTGAACAGTTAGACGTGAAATCCCCGGGCTCAACCTGGGAACTGCGTTTAATACTAGCAAGCTAGAGAAATAGAGAGGAAAGTGGAACTCCCAGTGTAGAGGTGAAATTCGTAGATATTGGGAAGAACACCAGTGGCGAAAGCGACTTTCTGGCTATTTTCTGACGCTGAGGAGCGAAAGCGTGGGGAGCAAACA\n' +
                '>SMHI:BalticPicoplankton:16S21:ASV:e49f2cee9ec0a04aeab623f901d7baa8\n' +
                'TGGGGAATTTTCCGCAATGGGCGAAAGCCTGACGGAGCAAGACCGCGTGGGGGAGGAAGGTTCTTGGATTGTCAACCCCTTTTCTCAGGGAAGAACACAATGACGGTACCTGAGGAAAAAGCATCGGCTAACTCCGTGCCAGCAGCCGCGGTAATACGGGGGATGCAAGCGTTATCCGGAATGATTGGGCGTAAAGAGTCCGTAGGTAGTCATCCAAGTCTGCTGTTAAAGAGCGAGGCTTAACCTCGTAAAGGCAGTGGAAACTGGAAGACTAGAGTGTAGTAGGGGCAGAGGGAATTCCTGGTGTAGCGGTGAAATGCGTAGAGATCAGGAAGAACACCGGTGGCGAAGGCGCTCTGCTGGGCTATAACTGACACTGAGGGACGAAAGCTAGGGGAGCGAATG\n' +
                '>SMHI:BalticPicoplankton:16S10:ASV:6619597433a4566890079ed6f624ae8f\n' +
                'TGGGGAATTTTGGACAATGGGGGCAACCCTGATCCAGCAATGCCGCGTGAGTGAAGAAGGCCTTCGGGTTGTAAAGCTCTTTTGTCAGGGAAGAAACAGCAGCTCTAACACAGCTGTGAATGACGGTACCTGAAGAATAAGCACCGGCTAACTACGTGCCAGCAGCCGCGGTAATACGTAGGGTGCAAGCGTTAATCGGAATTACTGGGCGTAAAGCGTGCGCAGGCGGTTATACAAGACAGGCGTGAAATCCCCGGGCTTAACCTGGGAATTGCGTCTGTGACTGTATGGCTAGAGTGTGTCAGAGGGGGGTAGAATTCCACGTGTAGCAGTGAAATGCGTAGATATGTGGAGGAATACCAATGGCGAAGGCAGCCCCCTGGGATAACACTGACGCTCATGCACGAAAGCGTGGGGAGCAAACA\n' +
                '>SMHI:BalticPicoplankton:16S3:ASV:d1202def0f98a025f3b5ce0043cd34d0\n' +
                'TGAGGAATATTGGACAATGGGCGCAAGCCTGATCCAGCCATGCCGCGTGCAGGAAGACGGCCCTATGGGTTGTAAACTGCTTTTATACGGGAAGAATAAGTGTTACGTGTAACACGATGACGGTACCGTAAGAATAAGCACCGGCTAACTCCGTGCCAGCAGCCGCGGTAATACGGAGGGTGCAAGCGTTATCCGGAATCATTGGGTTTAAAGGGTCCGTAGGTGGACTAATAAGTCAGTGGTGAAAGTCTGCAGCTTAACTGTAGAATTGCCATTGATACTGTTAGTCTTGAATTGTTGTGAAGTAACTAGAATATGTAGTGTAGCGGTGAAATGCATAGATATTACATAGAATACCGATTGCGAAGGCAGGTTACTAACAATATATTGACACTGATGGACGAAAGCGTGGGGAGCGAACA\n' +
                '>SMHI:BalticPicoplankton:16S21:ASV:d11068f859d83f710b1e627d9e91f40c\n' +
                'ACTTTAAGCAGGGAGAAAAAGTTATAAGTTAATACCTTATAACCCTGATGTTACCTGCAGAATAAGCACCGGCTAATTCCGTGCCAGCAGCCGCGGTAATACGGAAGGTGCAAGCGTTAATCGGAATTACTGGGCGTAAAGCGCGCGTAGGTGGTTTGTTAAGTTGGATGTGAAAGCCCTGGGCTCAACCTAGGAACTGCATCCAAAACTAACTCACTAGAGTACGATAGAGGGAGGTAGAATTCATAGTGTAGCGGTGGAATGCGTAGATATTATGAAGAATACCAGTGGCGAAGGCGGCCTCCTGGATCTGTACTGACACTGAGGTGCGAAAGCGTGGGTAGCGAACA\n' +
                '>SMHI:BalticPicoplankton:16S21:ASV:3afaa50a05d2d86be4571a4d964c3e7f\n' +
                'TAGGGAATCTTGGGCAATGGGCGAAAGCCTGACCCAGCGATGCCGCGTGTGCGAAGAAGGCCTTAGGGTTGTAAAGCACTTTCAGTCGTGAAGAAAAGCTACGATTTAATATGTCGTGGTCTTGACGTTAGCGACAGAAGAAGTACCGGCTAACTCCGTGCCAGCAGCCGCGGTAATACGGAGGGTACGAACGTTAATCGGAATTACTGGGCGTAAAGCGCGCGTAGGCGGTTTGATAAGTGGGATGTGAAAGCCCCGGGCTCAACCTGGGAACTGCATTCCAAACTGTCAGACTAGAGTGTGGTAGAGGGAGGTAGAATTTCCTGTGTAGCGGTGAAATGCGTAGATATAGGAAGGAATACCGATGGCGAAGGCAGCCTCCTGGACCAACACTGACGCTGAGGTGCGAAAGCGTGGGGAGCAAACA\n' +
                '>SMHI:BalticPicoplankton:16S21:ASV:73c93298451dcc16216ae103a95f78cf\n' +
                'CTTTCGCCAGAGATGATAATGACAGTATCTGGTAAAGAAACCCCGGCTAACTCCGTGCCAGCAGCCGCGGTAATACGGAGGGGGTTAGCGTTGTTCGGAATTACTGGGCGTAAAGCGCACGTAGGCGGATTAGTAAGTTAGAGGTGAAATCCCAGGGCTCAACCCTGGAACTGCCTTTAATACTGCTAGTCTTGAGTTCGAGAGAGGTAAGTGGAATTCCGAGTGTAGAGGTGAAATTCGTAGATATTCGGAGGAACACCAGTGGCGAAGGCGGCTTACTGGCTCGATACTGACGCTGAGGTGCGAAAGTGTGGGGAGCAAACA\n' +
                '>SMHI:BalticPicoplankton:16S21:ASV:eddec92462c6800adb4026d680198cb7\n' +
                'TGGGGAATTTTCCGCAATGGGCGAAAGCCTGACGGAGCAACGCCGCGTGAGGGATGAAGGCCTCTGGGCTGTAAACCTCTTTTATCAAGGAAGAAGATCTGACGGTACTTGATGAATAAGCCACGGCTAATTCCGTGCCAGCAGCCGCGGTAATACGGGAGTGGCAAGCGTTATCCGGAATTATTGGGCGTAAAGCGTCCGCAGGCGGCCCTTCAAGTCTGCTGTTAAAAAGTGGAGCTTAACTCCATCATGGCAGTGGAAACTGAGGGGCTTGAGTGTGGTAGGGGCAGAGGGAATTCCCGGTGTAGCGGTGAAATGCGTAGATATCGGGAAGAACACCAGTGGCGAAGGCGCTCTGCTGGGCCATCACTGACGCTCATGGACGAAAGCCAGGGGAGCGAAAG\n' +
                '>SMHI:BalticPicoplankton:16S21:ASV:7f427a4534bdaef7b053b04e37b7bf7e\n' +
                'TGAGGAATATTGGACAATGGAGGCAACTCTGATCCAGCCATGCCGCGTGCAGGATGACTGCCCTATGGGTTGTAAACTGCTTTTATACAGGAAGAAACATCTCTACGTGTAGAGACTTGACGGTACTGTAAGAATAAGGATCGGCTAACTCCGTGCCAGCAGCCGCGGTAATACGGAGGATCCAAGCGTTATCCGGAATCATTGGGTTTAAAGGGTCCGTAGGTGGATAATTAAGTCAGAGGTGAAATCCTGCAGCTCAACTGTAGAATTGCCTTTGATACTGGTTATCTTGAATTATTGTGAAGTAGTTAGAATATGTAGTGTAGCGGTGAAATGCATAGATATTACATAGAATACCGATTGCGAAGGCAGATTACTAACAATATATTGACACTGATGGACGAAAGCGTGGGGAGCGAACA\n' +
                '>SMHI:BalticPicoplankton:16S21:ASV:91817edabd5d2aeddb1fa1507a0bcf3b\n' +
                'TGGGGAATATTGCACAATGGGCGAAAGCCTGATGCAGCCATGCCGCGTGTGTGAAGAAGGCTCTAGGGTTGTAAAGCACTTTCAGTAGGGAGGAAAAGCTTAAGGTTAATAACCTTGAGCCCTGACGTTACCTACAGAAGAAGCACCGGCAAACTCCGTGCCAGCAGCCGCGGTAATACGGAGGGTGCGAGCGTTAATCGGAATTACTGGGCGTAAAGCGCGCGTAGGTGGTTTGATAAGCTAGCTGTGAAAGCCCCGGGCTCAACCTGGGAACTGCAGTTAGAACTGTCTGGCTAGAGTATAGTAGAGGGTGGCGGAATTTCCTGTGTAGCGGTGAAATGCGTAGATATAGGAAGGAACATCAGTGGCGAAGGCGGCCACCTGGACTAATACTGACACTGAGGTGCGAAAGCGTGGGGAGCAAACA\n';
        } else if (vm.selectedMarker === '12S') {
            vm.inputList =
                '>ASV1\n' +
                'caccgcggttatacgagggacccaagttgacagctgccggcgtaaagagtggttaagatagacccaaactaaagtcgaacaacttcaaagctgttatacgcttatgaaaaaacgaagcccaacaacgaaagtgactttaacttttctgattccacgaaagctagggaa\n' +
                '>ASV2\n' +
                'caccgcggttatacgagaggcccaagttaacggacattcggcgtaaagagtggttaaattttctttttactaaagccgaacgcccccactactgttatacgttttcgggggtaagaagcccctaacgaaagtagctttacctacattgaccccacgaaagctgtgaaa\n' +
                '>ASV3\n' +
                'caccgcggccatacgagtgttagcccaagtggacagttagcggcgtaaagcgtggttagagaattgccccaactaaagctgaagtacctcaaggctgtcgcacgcacccgagaatattaaacccaaccacgaaagtgactttaacccaactcgaacccacgaaagctgaggga\n' +
                '>ASV4\n' +
                'taccgcggttatacgagaggcccaagttgataagcatcggcgtaaagagtggttatggttaaataaatactaaagctgaacacttacaaagctgttatacgctcccgaaaataagaagaacaactacgaaagtggctttattacacccgaacccacgaaagccaaggca\n';
        } else if (vm.selectedMarker === '18S') {
            vm.inputList =
                '>5fb2fc3d29dc0698f78dc9faa41ff8ce9a0146ec\n' +
                'AGTTGGATTTCTGGCTTGGTGCGCGCCGTCCGCTGCGGTTACGTAGTGAGTGCGGTTGTGCGCCTGCCATCTTTCTGGTTAGCATGCTGTGCCCTTCACTGGGTGGCAGGTGTTGATCGGATCTTTTACTTTGAAAAAATTAGAGTGTTCAAAGCAGGCTTGCGCTATGAATACATTAGCATGGAATAATAATTTAGGACTTTTGTTCTATTTTGTTGGTTTCTAGGACGAAAGTAATGATTGATAGGGATA\n' +
                '>cd52b7cecafb5c4361bc438eb0fea4a4ba2e4b26\n' +
                'AGTTGGATTTCTGGCTTGGTGCGCACTGTCCGCCAAGGTTTCTTGGTGTGTACAGAAGTGCGCCTGCCATCCTTCCGGAAAATGACTCTACCCTTCACTGGGCCGGGGTCACTTCTGGATCATTTACTTTGAAAAAATTAGAGTGTTCAAAGCAGGCTTGCGCTATGAATACATTAGCATGGAATAATAATTTAGGACTTCTGTTCTATTTTGTTGGTTTCTAGGATGGAAGTAATGATTGATAGGGATA\n' +
                '>e3071847bb961195e8c23aef38c8dabf15f8583a\n' +
                'AGTTGGATTTCTGGCGAACCGTTGCGGCCCGTGCTCGTTTCGGGCGTGTGTGCCGTGTCGTGTTTGTCATCCTTCCAGAAAGCTGCGTCTACCATTCATTTGGCCGGACGTACGTGATCTGGATCGATTACTTTGAAAAAATTAGAGTGTTTAAAGCAGGCTTATGCTGTGAATACATTAGCATGGAATAATAATTTAGGACTTCGGTTCTATTTTGTTGGTTTCTAGGACTGAAGTAATGATTGATAGGGACA\n' +
                '>bc3026be03a1f06e9a5c39fd558321d939761d10\n' +
                'AGTTGGATTTCTGACCTGATACATTTGGCCGGCCGCGATTTCGCGTGTTAGTGCTTTATGTTCTGGTCATCCTTCCAATCGCAATTGGCTCTTCTTCATTGATTGGTCAGTTGTATTGGATCTTTTACTTTGAAAAAATTAGAGTGTTTCAAGCAGGCTTTATGCTATGAATACATTAGCATGGAATAATAATTTAGGACTTCGGTTCTATTTTGTTGGTTTCTAGGACTGAAGTAATGATTGATAGGGACA\n' +
                '>49d42d67b8aa2d54f4821ca727f3b84bb0b2f851\n' +
                'AGTTGGATTTCTGGCAGACGCCGGTTGCTCGCTTCCGCAAGGAAGTGCGGCTTCTGTGTGTTTGTCATCCTTCTAGATTGGGGTGATGCTCGGTTTACTCCTGGTGTCACCTTTGTCTAGATTTTTTACTTTGAAGAAATTAGAGTGTTCAAAGCAGGCATATCGCTTTGCATACATTAGCATGGAATAATACCATAGGACTTTTGTTCTATTGTGTTGGTCTAGAACTTAAGTAATGATTGATAGGGATA\n' +
                '>f46784a689cbf6e36497c2c85a40c5bb1cff2a65\n' +
                'AGTTGGACTTGTGTGCGCCGGATGCGGCGATCTGCGGCCAAAAGGTCGTTGCGATCAGCCCGTCCTGGCGCCGTAAAATTTGCAACTGAGTCTCCGCTGGTCTTAATTGGTCGGTGGCGTCTACTCGGTTGCTCGTTTACTGTGAGAAAATTGGAGTGTTCAAGGCAGGCGTGGATTGCAACTGAACATGTTAGCATGGAATAATAAGATAGGGCTCCGGCTCATATTTTGTTGGTTTCTAGAGCGTGGGAGTAATGATTGATAGGGACA\n' +
                '>a3e7981368208e98bf17eed5e51e61dd89fb3441\n' +
                'AGTTGGATTTCTGGCTTGGTGCGCGCTGTCCGCCAAGGTTTCTTGGTGTGTACAGAAGTGCGCCTGCCATCCTTCCGGAAAATGACTCTACCCTTCACTGGGCCGGGGTCACTTCTGGATCATTTACTTTGAAAAAATTAGAGTGTTCAAAGCAGGCTTGCGCTATGAATACATTAGCATGGAATAATAATTTAGGACTTCTGTTCTATTTTGTTGGTTTCTAGGATGGAAGTAATGATTGATAGGGATA\n' +
                '>490da40ee50e43bc5daf77b0c0243bd19a049f02\n' +
                'AGTTGGATTTCTGGCTTGGTGCGCCTGGCCCGCCACGGTTACGTGTGTGAGTGCTGGGTCGCGCCTGCCATCCTTCTAGAGAACGGTTCTACCCTTCATTGGGCCGGGGCCGCAATCTAGATCTTTTACTTTGAAAAAATTAGAGTGTTTAAAGCAGGCTTTTGCTATGAATACATTAGCATGGAATAATAATTTAGGACTTCGGTTCTATTTTGTTGGTTTCTAGGACTGAAGTAATGATTGATAGGGATA\n' +
                '>a70deed916dd6fd125973e511ad160febccb396d\n' +
                'AGTTGGATTTCTGGCTCGATACATTATGCCGGCCACCGTTTGGTGTGTTAGTGCATGATGTTTGGGCCATCCTTCCAATTGCTGCCTGCTACTCTTCACTGAGTGGTAGGTGGTATTGGATCTTTTACTTTGAAAAAATTAGAGTGTTTCAAGCAGGCTTTATGCTTTGAATACATTAGCATGGAATAATAATTTAGGACTTCGGTTCTATTTTGTTGGTTTCTAGGACTGAAGTAATGATTGATAGGGATA';
        }
    };

    vm.handleDrop = function (e) {
        var file = e.dataTransfer.files[0];
        parseFile(file);
    };

    $scope.handleFiles = function (files) {
        parseFile(files[0]);
    };

    vm.handleFasta = function (input) {
        parseFasta(input);
    };
    function parseFasta(inputString) {
        var result = [];

        var splitted = inputString.split('>');
        _.each(splitted, function (e) {
            var s = e.split('\n');
            if (s.length > 1 && s[0] && s[1]) {
                result.push({
                    occurrenceId: s[0].replace(/[^\x20-\x7E]/gim, ''),
                    marker: vm.selectedMarker,
                    sequence: s.slice(1).join('').replace(/[^\x20-\x7E]/gim, '')
                });
            }
        });
        vm.species = result;
        vm.matchedSequenceCount = 0;
        vm.aboveThresholdCount = 0;
        vm.inBackboneCount = 0;
        vm.blastMatchCount = 0;
        vm.normalizeAll();
        /*
        var fastaData = new Buffer(inputString);
        var parser = fasta();
        parser.on('data', function(data) {
            var e;
            try {
                e = JSON.parse(unescape(encodeURIComponent(data.toString())));
               // e = JSON.parse(utf8.encode(data.toString()));
                result.push({occurrenceId: e.id, marker: 'its', sequence: e.seq});
            } catch (err) {
                console.log(err);
            }
        });
        parser.on('end', function() {
            vm.species = result;
            vm.matchedSequenceCount = 0;
            vm.aboveThresholdCount = 0;
            vm.inBackboneCount = 0;
            vm.blastMatchCount = 0;
            vm.normalizeAll();
        });

        parser.write(fastaData);
        parser.end(); */
    }

    function parseCSV(csvString) {
        var converter = new Converter({
            delimiter: [',', ';', '$', '|', '\t']
        });

        vm.error = undefined;
        converter.fromString(csvString, function (err, result) {
            if (err) {
                vm.error = err;
            } else if (result.length == 0) {
                vm.error = 'There are no rows in the data.';
            } else if (result.length > 6000) {
                vm.error = 'Too many rows (maximum 6000)';
            } else {
                // make all keys lower to avoid casing issues
                result = result.map(function (e) {
                    return getLowerKeysObj(e);
                });
                if (_.get(result, '[0].marker')) {
                    var firstRecordMarker = _.get(result, '[0].marker');
                    if (firstRecordMarker.toLowerCase().indexOf('its') > -1) {
                        vm.selectedMarker = 'ITS';
                    } else if (firstRecordMarker.toLowerCase().indexOf('coi') > -1 || firstRecordMarker.toLowerCase().indexOf('co1') > -1) {
                        vm.selectedMarker = 'COI';
                    } else if (firstRecordMarker.toLowerCase().indexOf('16s') > -1) {
                        vm.selectedMarker = '16S';
                    } else if (firstRecordMarker.toLowerCase().indexOf('12s') > -1) {
                        vm.selectedMarker = '12S';
                    } else if (firstRecordMarker.toLowerCase().indexOf('18s') > -1) {
                        vm.selectedMarker = '18S';
                    }
                }
                if (
                    result.every(function (e) {
                        return e.sequence || e.consensussequence;
                    })
                ) {
                    result.forEach(function (e) {
                        e.occurrenceId =
                            e.occurrenceId ||
                            e.occurrenceid ||
                            e.occurrenceID ||
                            e.id;
                        e.sequence = e.sequence || e.consensussequence;
                        e.marker = e.marker || vm.selectedMarker;
                    });
                    vm.species = result;
                    vm.matchedSequenceCount = 0;
                    vm.aboveThresholdCount = 0;
                    vm.inBackboneCount = 0;
                    vm.blastMatchCount = 0;
                    vm.normalizeAll();
                } else {
                    vm.error =
                        'all rows must have a sequence or consensusSequence field - see example file for the required format';
                }
            }
            $scope.$apply();
        });
    }
    var isValidFile = function (file) {
        return (
            !!file &&
            (file.type == '' ||
                file.type == 'text/csv' ||
                file.type == 'text/plain' ||
                file.name.indexOf('.csv') > 1 ||
                file.name.indexOf('.fasta') > 1 ||
                file.name.indexOf('.fas') > 1) ||
            file.name.indexOf('.fa') > 1
        );
    };

    function getLowerKeysObj(obj) {
        var key,
            keys = Object.keys(obj);
        var n = keys.length;
        var newobj = {};
        while (n--) {
            key = keys[n];
            newobj[key.toLowerCase()] = obj[key];
        }
        return newobj;
    }

    var parseFile = function (file) {
        vm.invalidFileFormat = false;
        if (!isValidFile(file)) {
            vm.invalidFileFormat = true;
            vm.error =
                'Invalid file format - the file must be a csv file and all rows must have a scientificName column';
            return;
        }
        var reader = new FileReader();
        reader.onload = function () {
            var csvString = reader.result;
            if (file.name.indexOf('.csv') > 1) {
                parseCSV(csvString);
            } else if (
                file.name.indexOf('.fasta') > 1 ||
                file.name.indexOf('.fas') > 1 ||
                file.name.indexOf('.fa') > 1
            ) {
                parseFasta(csvString);
            }
        };
        reader.readAsText(file);
    };

    vm.normalizeAll = function () {
        vm.pagination.currentPage = 1;
        vm.processing = true;
        blastAll();
    };

    function blast(item, callback) {
        var query = {
            sequence: item.sequence.replace(/[-.]/g, ''),
            marker: item.marker || 'its'
        };
        return new Promise(function (resolve, reject) {
            $http({
                method: 'post',
                data: query,
                url: '/api/blast'
            }).then(
                function successCallback(response) {
                    item.match = response.data;
                    vm.setItem(item, response.data);
                    delete erroredItems[item.occurrenceId];

                    if (typeof callback === 'function') {
                        callback();
                    }
                    resolve();
                }
            ).catch(
                function errorCallback(response) {
                    // console.log(response);
                    erroredItems[item.occurrenceId] = item;
                    if (erroredItems.length > Math.min(MAX_ERRORS, vm.species.length)) {
                        vm.error =
                            'The server is not responding. Please try again later and report an issue if the problem persists.';
                    }
                    if (typeof callback === 'function') {
                        callback('match went wrong');
                    }
                    // console.log('Got an error for ' + item.sequence);
                    resolve();
                }
            );
        });
    }

    /*     function blastAll() {
            async.eachLimit(vm.species, 10, blast, function(err) {
                if (err) {
                    // TODO inform the user that not everything could be matched
                } else {
                    vm.lookupComplete = true;
                }
            });
        } */
    function blastAll(list) {
        var blastlimit = pLimit(4);

        Promise.all((list || vm.species).map(function (s) {
            return blastlimit(
                blast, s);
        })).then(function (res) {
            // console.log(res);
            var erroredAsArray = Object.keys(erroredItems).map(function (k) {
                return erroredItems[k];
            });
            if (erroredAsArray.length > 0 && retries > 0) {
                retries--;
                blastAll(erroredAsArray);
            } else if (erroredAsArray.length > 0 && retries < 1) {
                vm.lookupComplete = true;
                vm.matchError = erroredAsArray.length + ' of ' + vm.species.length + '  sequences could not be matched';
            } else {
                vm.lookupComplete = true;
            }
        });
    }

    vm.setItem = function (item, selected) {
        // eslint-disable-next-line max-len
        var fields = [
            'name',
            'identity',
            'bitScore',
            'expectValue',
            'matchType',
            'appliedScientificName',
            'accession'
        ];
        fields.forEach(function (field) {
            item[field] = selected[field];
        });
        item.queryCoverage = selected['qcovs'];
        item.queryLength = item.sequence.length;
        if (
            selected.nubMatch &&
            selected.nubMatch.usage &&
            selected.nubMatch.usage.formattedName
        ) {
            item.formattedName = selected.nubMatch.usage.formattedName;
        }
        item.scientificName = selected.name;
        item.nubMatch = selected.nubMatch;

        if (selected.nubMatch && selected.nubMatch.classification) {
            var classification = '';
            var formattedClassification = '';
            for (var i = 0; i < selected.nubMatch.classification.length; i++) {
                formattedClassification +=
                    '<a href="/species/' +
                    selected.nubMatch.classification[i].key +
                    '" target="_BLANK">' +
                    selected.nubMatch.classification[i].name +
                    '</a>';
                classification += selected.nubMatch.classification[i].name;
                if (i < selected.nubMatch.classification.length - 1) {
                    classification += '_';
                    formattedClassification += ' &#10095; ';
                }
            }
            item.classification = classification;
            item.formattedClassification = formattedClassification;
        }

        vm.matchedSequenceCount++;
        if (item.identity > vm.matchThreshold) {
            vm.aboveThresholdCount++;
        }
        if (item.nubMatch && item.nubMatch.usage) {
            vm.inBackboneCount++;
        }
        if (selected.matchType && selected.matchType !== 'BLAST_NO_MATCH') {
            vm.blastMatchCount++;
        }
    };

    vm.generateCsv = function () {
        var fields = [
            'occurrenceId',
            'marker',
            'identity',
            'bitScore',
            'expectValue',
            'queryCoverage',
            'matchType',
            'scientificName',
            'classification',
            'sequence'
        ];
        var csvContent = '';

        // write column names
        fields.forEach(function (field, index) {
            csvContent += '"' + field + '"';
            if (index < fields.length - 1) {
                csvContent += ',';
            }
        });
        csvContent += '\n';

        // write rows
        vm.species.forEach(function (e) {
            // write row
            if (e.matchType === 'BLAST_NO_MATCH' && vm.exclude) {
                return;
            }
            fields.forEach(function (field, index) {
                csvContent +=
                    e[field] || e[field] === 0 ? '"' + e[field] + '"' : '';
                if (index < fields.length - 1) {
                    csvContent += ',';
                }
            });
            csvContent += '\n';
        });
        // add string to href as data uri making it downloadable
        document.getElementById('sequenceMatcher_generatedCsv').href =
            'data:application/octet-stream,' + encodeURI(csvContent);
        vm.download = true;
    };

    vm.getMatchTypeClass = function (matchType) {
        if (matchType == 'BLAST_NO_MATCH') {
            return 'badge badge--error';
        }
        if (matchType == 'BLAST_WEAK_MATCH') {
            return 'badge badge--error';
        }
        if (matchType == 'BLAST_CLOSE_MATCH') {
            return 'badge badge--warning';
        }
        if (matchType == 'BLAST_AMBIGUOUS_MATCH') {
            return 'badge badge--warning';
        }
        if (matchType == 'BLAST_EXACT_MATCH') {
            return 'badge badge--approved';
        }
    };

    function align(match) {
        var paddingLength = Math.max(match.qstart.length, match.sstart.length) + 1;
        var q =
            'query ' +
            match.qstart.padEnd(paddingLength) +
            match.querySequence + ' ' + match.qend +
            '<br/>';
        var diff = ''.padEnd(paddingLength + 6);
        var s =
            'sbjct ' +
            match.sstart.padEnd(paddingLength) +
            match.subjectSequence + ' ' + match.send;
        var q2 = match.querySequence.split('');
        var s2 = match.subjectSequence.split('');

        for (var i = 0; i < q2.length; i++) {
            if (q2[i] === s2[i]) {
                diff = diff + '|';
            } else {
                diff = diff + ' ';
            }
        }
        return q + diff + '<br/>' + s;
    }


    vm.showAlignment = function (match) {
        vm.currentAligment = {
            header: (_.get(match, 'nubMatch.usage.formattedName') ? _.get(match, 'nubMatch.usage.formattedName') : match.name),
            subHeader: 'identity: ' + match.identity + ' | bitScore: ' + match.bitScore + ' | expectValue: ' + match.expectValue,
            alignment: align(match)
        };
        if (match.alternatives && match.alternatives) {
            vm.currentAligment.alternatives = [];
            for (var i = 0; i < match.alternatives.length; i++) {
                vm.currentAligment.alternatives.push({
                    header: (_.get(match.alternatives[i], 'nubMatch.usage.formattedName') ? _.get(match.alternatives[i], 'nubMatch.usage.formattedName') : match.alternatives[i].name),
                    subHeader: 'identity: ' + match.alternatives[i].identity + ' | bitScore: ' + match.alternatives[i].bitScore + ' | expectValue: ' + match.alternatives[i].expectValue,
                    alignment: align(match.alternatives[i])
                });
            }
        }
        vm.showAligmentOverlay = true;
    };

    vm.closeAligmentOverlay = function () {
        vm.showAligmentOverlay = false;
        vm.currentAligment = null;
    };

    hotkeys.add({
        combo: 'alt+right',
        description: 'Next',
        callback: function () {
            if (
                vm.pagination.currentPage * vm.pagination.pageSize <
                vm.species.length
            ) {
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

    vm.help = {
        occurrenceId:
            'If you uploaded data in FASTA format, this is the ID line for the sequence. For publication to GBIF occurrenceId must be unique.',
        marker: 'The DNA markers, COI, ITS, 16S, 18S and 12S are supported',
        identity:
            'The extent to which two sequences have the same residues at the same positions in an alignment',
        bitScore:
            'The bit score is the required size of a sequence database in which the current match could be found just by chance. The bit score is a log2 scaled and normalized raw score. Each increase by one doubles the required database size  (2<sup>bit-score</sup>).',
        expectValue:
            'The expect value is a parameter that describes the number of hits one can "expect" to see by chance when searching a database of a particular size. It decreases exponentially as the score of the match increases. Hence, a low expect value is better.',
        queryCoverage: 'How much of the query(input) sequence aligns with the match in the the reference database, in percent.',
        queryLength: 'Length of the query(input) sequence. Short sequences may give unreliable results.',
        matchType: 'Badges representing different identity thresholds.',
        scientificName:
            'The OTU identifier, which can be used as scientificName when publishing occurrence or sample event data to GBIF',
        classification:
            'The higher classification of the OTU as represented in the GBIF backbone.'
    };
}

module.exports = sequenceMatchingCtrl;
