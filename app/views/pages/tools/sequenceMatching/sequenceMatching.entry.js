'use strict';

var async = require('async');
var Converter = require('csvtojson').Converter;
var _ = require('lodash');

angular
    .module('portal')
    .controller('sequenceMatchingCtrl', sequenceMatchingCtrl);

/** @ngInject */
function sequenceMatchingCtrl($http, $scope, hotkeys, $location) {
    var vm = this;
    vm.species = undefined;
    var MAX_ERRORS = 5;
    vm.state = {};
    vm.pagination = {
        currentPage: 1,
        pageSize: 20
    };
    vm.itemToEdit = undefined;
    vm.error;
    vm.$location = $location;
    vm.matchThreshold = 98.5;
    window.onbeforeunload = function(e) {
        if (!vm.error && vm.species && vm.species.length > 0) {
            var dialogText = 'By leaving the page you loose your data.';
            e.returnValue = dialogText;
            return dialogText;
        }
    };
    vm.loadTestData = function() {
        vm.inputList =
            '> 1 Unknown fungus\n' +
            'ATTACTCATCCAAATCCTTTGGATGGACTTGAGCTTGCATTAGCTGGCTTGAAATGAATTGGGTAAACATCTACCATGTCTATCGTCATATTTATTTGCGATATTCTAACTGGTAGTGAGTAGTCCCTTAATAATTTTTAA\n\n' +
            '> 2 Cortinarius sp.\n' +
            'CCTGATAAGTTGCTGCTGGTTCTCTAGGGAGCATGTGCACGCTTGTCATCTTTATATCTTCACCTGTGCACCTTTTGTAGACCTGAATATCTTTCTGAATGCTTTTTTTATTTTAGCACTCAGGATATGGAATTGGCTTTGATGTCTCTTCTTATATTTTCAGGTCTATGTTTCTTCATATACCCTAATGTATGTTATAGAATGT' +
            'CATTTAATGGGCTTTTTATGCCTTTAAATCTATTACAACTTTCAGCAACGGATCTCTTGGCTCTCGCATCGATGAAGAACGCAGCGAAATGCGATAAGTAATGTGAATTGCAGAATTCAGTGAATCATCGAATCTTTGAACGCACCTTGCGCTCCTTGGTATTCCGAGGAGCATGCCTGTTTGAGTGTCATTAATATTATCAACCTCTTTGGTTGGATTTGGGTTTACTGGCCTTGTTGAGGTCAGCTCTCCTTAAATGCATTAGCAGACAACATTTTGTCAACCGTTCATTGGTGTGATAATTATCTACGCTATTGATCGTGAAGGCAGGGTTCAGCTTCTAACAGTCCATTGGCTTGGACAAATTTTATTAATGTGACCTCAAATCAGGTAGGACTACCCGCTGAACTTAAGCA\n\n' +
            '> 3 Entoloma sp.\n' +
            'CATTATTGAATAAGCTTGGTTTCAGATTGTTGCTGGTTCTGCGGGACATGTGCACGTCTGTTCCATTTTTGTTACCACCTGTGCACTTTGTGTAGATCTGAATAACTCTCGAGGCAAACCTCGGTCTTCAAGACATTGCTGGGCATTTGAGATGTACGGCTTTGTCATTATATATTCAGATCTATGTCTTACTACACTACACAATAACAAGTATCTGAAGTTGGTTGCACCTATAAAGATATATTATAACTTTCAACAACGGATCTCTTGGCTCTCGCATCGATGAAGAACGCAGCGAAATGCGATAAGTAATGTGAATTGCAGAATTCAGTGAATCATCGAATCTTTGAACGCACCTTGCGCTCCTTGGTATTCCGAGGAGCATGCCTGTTTGAGTGTCATGAAATCCCTCATCCTTTCGAGCTTTTATTATTAAGCTTGTCAGGCTTTGGATTCTGGGAGTTTGCTGGCTTTATCGAGTCAGCTCTTCTTAAATGTATTAGCAAGATCATCGCTAAATCATCTTTGATATGATAATTATCTATATCAATAAATGAGACCTAAGCGGATTCCATTTCGGAAAACAGATCGAGCTTTACAATCGTCTCAGGACAATTTGAATCATTGACCTCAAATCAG';
    };

    vm.handleDrop = function(e) {
        var file = e.dataTransfer.files[0];
        parseFile(file);
    };

    $scope.handleFiles = function(files) {
        parseFile(files[0]);
    };

    vm.handleFasta = function(input) {
        parseFasta(input);
    };
    function parseFasta(inputString) {
        var result = [];

        var splitted = inputString.split('>');
        _.each(splitted, function(e) {
            var s = e.split('\n');
            if (s.length > 1 && s[0] && s[1]) {
                result.push({
                    occurrenceId: s[0].replace(/[^\x20-\x7E]/gim, ''),
                    marker: 'its',
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
        converter.fromString(csvString, function(err, result) {
            if (err) {
                vm.error = err;
            } else if (result.length == 0) {
                vm.error = 'There are no rows in the data.';
            } else if (result.length > 6000) {
                vm.error = 'Too many rows (maximum 6000)';
            } else {
                // make all keys lower to avoid casing issues
                result = result.map(function(e) {
                    return getLowerKeysObj(e);
                });
                if (
                    result.every(function(e) {
                        return e.sequence || e.consensussequence;
                    })
                ) {
                    result.forEach(function(e) {
                        e.occurrenceId =
                            e.occurrenceId ||
                            e.occurrenceid ||
                            e.occurrenceID ||
                            e.id;
                        e.sequence = e.sequence || e.consensussequence;
                        e.marker = e.marker || 'its';
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
    var isValidFile = function(file) {
        return (
            !!file &&
            (file.type == '' ||
                file.type == 'text/csv' ||
                file.type == 'text/plain' ||
                file.name.indexOf('.csv') > 1 ||
                file.name.indexOf('.fasta') > 1 ||
                file.name.indexOf('.fas') > 1)
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

    var parseFile = function(file) {
        vm.invalidFileFormat = false;
        if (!isValidFile(file)) {
            vm.invalidFileFormat = true;
            vm.error =
                'Invalid file format - the file must be a csv file and all rows must have a scientificName column';
            return;
        }
        var reader = new FileReader();
        reader.onload = function() {
            var csvString = reader.result;
            if (file.name.indexOf('.csv') > 1) {
                parseCSV(csvString);
            } else if (
                file.name.indexOf('.fasta') > 1 ||
                file.name.indexOf('.fas') > 1
            ) {
                parseFasta(csvString);
            }
        };
        reader.readAsText(file);
    };

    vm.normalizeAll = function() {
        vm.pagination.currentPage = 1;
        vm.processing = true;
        blastAll();
    };
    var errorCount = 0;

    function blast(item, callback) {
        var query = {
            sequence: item.sequence.replace(/[-.]/g, ''),
            marker: item.marker || 'its'
        };
        $http({
            method: 'post',
            data: query,
            url: '/api/blast'
        }).then(
            function successCallback(response) {
                item.match = response.data;
                vm.setItem(item, response.data);
                callback();
            },
            function errorCallback(response) {
                // console.log(response);
                errorCount++;
                if (errorCount > Math.min(MAX_ERRORS, vm.species.length)) {
                    vm.error =
                        'The server is not responding. Please try again later and report an issue if the problem persists.';
                }
                callback('match went wrong');
            }
        );
    }

    function blastAll() {
        async.eachLimit(vm.species, 10, blast, function(err) {
            if (err) {
                // TODO inform the user that not everything could be matched
            } else {
                vm.lookupComplete = true;
            }
        });
    }

    vm.setItem = function(item, selected) {
        // eslint-disable-next-line max-len
        var fields = [
            'name',
            'identity',
            'bitScore',
            'expectValue',
            'matchType',
            'appliedScientificName'
        ];
        fields.forEach(function(field) {
            item[field] = selected[field];
        });

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

    vm.generateCsv = function() {
        var fields = [
            'occurrenceId',
            'marker',
            'identity',
            'bitScore',
            'expectValue',
            'matchType',
            'scientificName',
            'classification',
            'sequence'
        ];
        var csvContent = '';

        // write column names
        fields.forEach(function(field, index) {
            csvContent += '"' + field + '"';
            if (index < fields.length - 1) {
                csvContent += ',';
            }
        });
        csvContent += '\n';

        // write rows
        vm.species.forEach(function(e) {
            // write row
            if (e.matchType === 'BLAST_NO_MATCH' && vm.exclude) {
                return;
            }
            fields.forEach(function(field, index) {
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

    vm.getMatchTypeClass = function(matchType) {
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


    vm.showAlignment = function(match) {
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

    vm.closeAligmentOverlay = function() {
        vm.showAligmentOverlay = false;
        vm.currentAligment = null;
    };

    hotkeys.add({
        combo: 'alt+right',
        description: 'Next',
        callback: function() {
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
        callback: function() {
            if (vm.pagination.currentPage > 1) {
                vm.pagination.currentPage -= 1;
            }
        }
    });

    hotkeys.add({
        combo: 'esc',
        description: 'close',
        allowIn: ['INPUT'],
        callback: function() {
            vm.itemToEdit = undefined;
        }
    });

    vm.help = {
        occurrenceId:
            'If you uploaded data in FASTA format, this is the ID line for the sequence. For publication to GBIF occurrenceId must be unique.',
        marker: 'The DNA marker, currently only ITS is supported',
        identity:
            'The extent to which two sequences have the same residues at the same positions in an alignment',
        bitScore:
            'The bit score is the required size of a sequence database in which the current match could be found just by chance. The bit score is a log2 scaled and normalized raw score. Each increase by one doubles the required database size  (2<sup>bit-score</sup>).',
        expectValue:
            'The expect value is a parameter that describes the number of hits one can "expect" to see by chance when searching a database of a particular size. It decreases exponentially as the score of the match increases. Hence, a low expect value is better.',
        matchType: 'Badges representing different identity thresholds.',
        scientificName:
            'The OTU identifier, which can be used as scientificName when publishing occurrence or sample event data to GBIF',
        classification:
            'The higher classification of the OTU as represented in the GBIF backbone.'
    };
}

module.exports = sequenceMatchingCtrl;
