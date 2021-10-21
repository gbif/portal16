/* eslint-disable no-undef */
let spam = require('./spamUtils.js');

describe('Spam detection', function() {
    it('can stop spam referers', function() {
        // obviously wrong
        expect(spam.isSpamReferer(undefined)).toEqual(true);
        expect(spam.isSpamReferer(5)).toEqual(true);
        expect(spam.isSpamReferer('http://something_not_gbif.com')).toEqual(false);
        expect(spam.isSpamReferer('https://other.org')).toEqual(true);

        // should we allow - we do not for now
        expect(spam.isSpamReferer('https://subsite.gbif.org')).toEqual(true);

        // accepted
        expect(spam.isSpamReferer('https://www.gbif.org')).toEqual(false);
        expect(spam.isSpamReferer('https://www.gbif.org/some/page?anywhere=true')).toEqual(false);
        expect(spam.isSpamReferer('http://localhost:2000/some/page?anywhere=true')).toEqual(false);
    });

    it('will block if links are repeated', function() {
        expect(spam.isSpammingLinks('Something //spamsite.com it is SOO important //spamsite.com to see this //spamsite.com')).toEqual(true);
        expect(spam.isSpammingLinks('The way vertnet //vertnet.com does it is much better')).toEqual(false);
    });

    // we have removed most spam checking as it started to be more of an obstacle than a quality. Spam was an issue for a short while, but disappeared again
    // it('will block if content is suspicious', function() {
    //     let spamTerms = ['rhino viagra', '[EAT IT]', 'fun-time', '▥'];
    //     let generatedTerms = spam.generateTerms(spamTerms);
    //     let terms = generatedTerms.terms;
    //     let normalizedTerms = generatedTerms.normalizedTerms;

    //     // should be rejected
    //     // the option to write proper error messages was removed in Jasmine. See https://github.com/jasmine/jasmine/issues/1484
    //     expect(spam.isSpamContent('Eat this rhino viagra', 'test', terms, normalizedTerms)).toEqual(true); // spaces
    //     expect(spam.isSpamContent('eat.rhino.viagra', 'test', terms, normalizedTerms)).toEqual(true); // punctuation
    //     expect(spam.isSpamContent('eat.rhino,viagra', 'test', terms, normalizedTerms)).toEqual(true); // commas
    //     expect(spam.isSpamContent('eat*rhino*viagra', 'test', terms, normalizedTerms)).toEqual(true); // astrix
    //     expect(spam.isSpamContent('eat*rhino\n*viagra', 'test', terms, normalizedTerms)).toEqual(true); // newlines
    //     expect(spam.isSpamContent('eatrhino   *    viagra', 'test', terms, normalizedTerms)).toEqual(true); // multiple spaces is discarded
    //     expect(spam.isSpamContent('wanna have a fun time?', 'test', terms, normalizedTerms)).toEqual(true); // missing dashes
    //     expect(spam.isSpamContent('wanna have a fun~¨^time?', 'test', terms, normalizedTerms)).toEqual(true); // handle a select few symbols
    //     expect(spam.isSpamContent('you should [eat-it]', 'test', terms, normalizedTerms)).toEqual(true); // hard brackets
    //     expect(spam.isSpamContent('you can filter out unicode ▥ characters', 'test', terms, normalizedTerms)).toEqual(true); // can block select unicode terms

    //     // should be okay
    //     expect(spam.isSpamContent('you should be able to write japanese あ', 'test', terms, normalizedTerms)).toEqual(false); // Japanese is okay
    //     expect(spam.isSpamContent('most plain text should be fine. That goes also for fx danish æøå', 'test', terms, normalizedTerms)).toEqual(false); // Most plain text should be fine
    // });
});
