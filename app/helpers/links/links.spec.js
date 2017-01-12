var linkHelper = require('./links.js');

describe("insert links in text to minimize translation work", function () {
    it("can insert links", function () {
        expect(linkHelper.insertLinks('click {here}', 'linkA')).toEqual('click <a href="linkA">here</a>');
        expect(linkHelper.insertLinks('click {here}', 'linkA', '_blank')).toEqual('click <a href="linkA" target="_blank">here</a>');
        expect(linkHelper.insertLinks('click {here} or {there} to complete', ['linkA', 'linkB'])).toEqual('click <a href="linkA">here</a> or <a href="linkB">there</a> to complete');
    });

    it("degrades to text only on faulty input", function () {
        expect(linkHelper.insertLinks('click {here', 'linkA')).toEqual('click here');
        expect(linkHelper.insertLinks('click {here}')).toEqual('click here');
        expect(linkHelper.insertLinks('click {here}', ['linkA', 'linkB'])).toEqual('click here');
        expect(linkHelper.insertLinks('click {here} and {there}', 'linkA')).toEqual('click here and there');
    });
});

describe("make links into a tags and mails into mail links", function () {
    it("can transform into a tags", function () {
        var testString = 'replace this mymail@gmail.com and this one thisMail@gbif.org and show a link to http://mysite.com but not to relative ones like this /occurrence/234';
        var expectedString = 'replace this <a href="mailto:mymail@gmail.com">mymail@gmail.com</a> and this one <a href="mailto:thisMail@gbif.org">thisMail@gbif.org</a> and show a link to <a href="http://mysite.com">mysite.com</a> but not to relative ones like this /occurrence/234';
        expect(linkHelper.linkify(testString)).toEqual(expectedString);
    });
});

