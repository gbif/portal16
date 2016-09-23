var rewire = require('rewire'),
    format = require('./format.js');

//Necessary because Node does not ship with localization
require('./intlPolyfill.js').setSupportedLocales(['en', 'da', 'jp']);

describe("formatter", function () {
    it("can localize dates", function () {
        expect(format.date('2015-11-17T15:33:41.103+0000')).toEqual('November 17, 2015');
        expect(format.date('2015-11-17T15:33:41.103+0000', 'en')).toEqual('November 17, 2015');
        expect(format.date('2015-11-17T15:33:41.103+0000', 'da')).toEqual('17. november 2015');
        expect(format.date('1460901850', 'en')).toEqual('April 17, 2016');
        //expect(format.date('nonsense', 'da')).toEqual('Invalid date');
    });

    it("can localize integers", function () {
        expect(format.localizeInteger(123456789)).toEqual('123,456,789');
        expect(format.localizeInteger(345678, 'jp')).toEqual('345,678');
        expect(format.localizeInteger('987654321')).toEqual('987,654,321');
        expect(format.localizeInteger('123String')).toEqual('');
    });
});

