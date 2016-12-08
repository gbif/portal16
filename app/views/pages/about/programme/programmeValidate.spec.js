'use strict';

var relatedProjects = require('./programmeValidate.mock.json'),
    relatedProjectsValidate = require('./programmeValidate');

describe('Project table integrity', function(){

    it('All related project has grant type assigned', function(){
        expect(relatedProjectsValidate(relatedProjects)).toBe(true);
    });

});