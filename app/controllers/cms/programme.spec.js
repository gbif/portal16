'use strict';

let request = require('request'),
    cmsApi = require('../../models/cmsData/apiConfig'),
    helper = require('../../models/util/util'),
    commonTerms = require('../../../spec/commonTerms');

describe('Programme content integrity', function(){

    let node82243;
    let path = cmsApi.programme.url + '82243';

    beforeEach(function(done){
        helper.getApiData(path, function(err, data) {
            if (data) {
                node82243 = data.data[0];
                done();
            }
        });
    }, 5000);

    it('Programme title is correct', function(done){
        expect(node82243.title).toBe(commonTerms.bidProjectTitle);
        done();
    }, 5500);

    it('All related project has grant type assigned', function(done){
        node82243.relatedProjects.forEach(function(project){
            expect(['small', 'national', 'regional'].indexOf(project.grantType)).not.toBe(-1);
        });
        done();
    }, 5500);
});