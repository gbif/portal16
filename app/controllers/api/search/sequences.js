'use strict';

const blast = require('../tools/blast/blast');
const _ = require('lodash');
const pattern = /^[CAGTcagt]+$/;
// const markers = ['ITS', 'COI', '16S', '12S', '18S'];

async function query(query) {
    if (query.length < 150) {
        return {count: 0, results: []};
    } else if (pattern.test(query)) {
      const databases = await blast.getDatabasesAvailable();
      const results = await Promise.all(databases.map((db) => blast.blast({database: db.db, sequence: query}) ));
      const filteredResults = results.filter((r) => ['BLAST_EXACT_MATCH', 'BLAST_AMBIGUOUS_MATCH', 'BLAST_CLOSE_MATCH'].includes(r.matchType)).map((e) => _.merge(e, {alignment: align(e)}));
      return {count: filteredResults.length, results: filteredResults};
    } else {
        return {count: 0, results: []};
    }
}

function align(match) {
    if (match.alignment) {
        return match.alignment;
    } else {
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
}

module.exports = {
    query: query
};
