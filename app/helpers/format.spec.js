let rewire = require('rewire'),
    format = require('./format.js');

// Necessary because Node does not ship with localization
require('./intlPolyfill.js').setSupportedLocales(['en', 'da', 'jp']);

describe('formatter', function() {
    it('can localize dates', function() {
        expect(format.date('2015-11-17T15:33:41.103+0000')).toEqual('17 November 2015');
        expect(format.date('2015-11-17T15:33:41.103+0000', 'en')).toEqual('17 November 2015');
        expect(format.date('2015-11-17T15:33:41.103+0000', 'da')).toEqual('17. november 2015');
        expect(format.date('1460901850', 'en')).toEqual('17 April 2016');
        // expect(format.date('nonsense', 'da')).toEqual('Invalid date');
    });
});

