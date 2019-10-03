'use strict';

const blast = require('../tools/blast/blast');
const _ = require('lodash');
const pattern = /^[CAGTcagt]+$/;
const markers = ['ITS', 'COI'];

async function query(query) {
    if (query.length < 150) {
        return {count: 0, results: []};
    } else if (pattern.test(query)) {
      const results = await Promise.all(markers.map((marker) => blast.blast({marker: marker, sequence: query}) ));
      const filteredResults = results.filter((r) => ['BLAST_EXACT_MATCH', 'BLAST_CLOSE_MATCH'].includes(r.matchType)).map((e) => _.merge(e, {alignment: align(e)}));
      return {count: filteredResults.length, results: filteredResults};
    } else {
        return {count: 0, results: []};
    }
}

function align(match) {
    let paddingLength = Math.max(match.qstart.length, match.sstart.length) + 1;
    let q =
        'query ' +
        match.qstart.padEnd(paddingLength) +
        match.querySequence + ' ' + match.qend +
        '<br/>';
    let diff = ''.padEnd(paddingLength + 6);
    let s =
        'sbjct ' +
        match.sstart.padEnd(paddingLength) +
        match.subjectSequence + ' ' + match.send;
    let q2 = match.querySequence.split('');
    let s2 = match.subjectSequence.split('');

    for (let i = 0; i < q2.length; i++) {
        if (q2[i] === s2[i]) {
            diff = diff + '|';
        } else {
            diff = diff + ' ';
        }
    }
    return q + diff + '<br/>' + s;
}

module.exports = {
    query: query
};
