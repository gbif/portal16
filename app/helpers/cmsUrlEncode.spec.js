'use strict';

let env = process.env.NODE_ENV || 'local',
    cmsUrlEncode = require('./cmsUrlEncode'),
    apiConfig = require('../models/gbifdata/apiConfig');

let cmsDomain;
switch (env) {
    case 'local':
        cmsDomain = 'bko.gbif.org';
        break;
    case 'dev':
        cmsDomain = 'cms.gbif-dev.org';
        break;
    case 'uat':
        cmsDomain = 'cms.gbif-uat.org';
        break;
    case 'prod':
        cmsDomain = 'cms.gbif-uat.org';
        break;
}

describe('CMS content formatting', function() {
    it('Image URLs in markdown are converted correctly', function(){
        let targetUrl1 = '![screenshot-1](' + apiConfig.image.url + 'http%3A%2F%2F' + cmsDomain + '%2Fsites%2Fdefault%2Ffiles%2Fdocuments%2Fspecies-populations-demo1.png "Screenshot 1")';
        expect(cmsUrlEncode.extractAndEncodeUriMarkdown('![screenshot-1](http://' + cmsDomain + '/sites/default/files/documents/species-populations-demo1.png "Screenshot 1")'))
            .toEqual(targetUrl1);

        let targetUrl2 = '![EU](' + apiConfig.image.url + 'http%3A%2F%2F' + cmsDomain + '%2Fsites%2Fdefault%2Ffiles%2Fdocuments%2Fspecies-populations-eu-logo.png "EU")';
        expect(cmsUrlEncode.extractAndEncodeUriMarkdown('![EU](http://' + cmsDomain + '/sites/default/files/documents/species-populations-eu-logo.png "EU")'))
            .toEqual(targetUrl2);
    });
    it('Image URLs in HTML are converted correctly', function(){
        let sourceUrl3 = 'src="http://' + cmsDomain + '/sites/default/files/images/2015-September/BID-v2.png"';
        let targetUrl3 = 'src="' + apiConfig.image.url + 'http%3A%2F%2F' + cmsDomain + '%2Fsites%2Fdefault%2Ffiles%2Fimages%2F2015-September%2FBID-v2.png"';
        expect(cmsUrlEncode.extractAndEncodeUriHtml(sourceUrl3)).toEqual(targetUrl3);

        let sourceUrl4 = 'src="http://' + cmsDomain + '/sites/default/files/styles/finder_image/public/gbif_project/images/organizations/flag_yellow_high.jpg"';
        let targetUrl4 = 'src="' + apiConfig.image.url + 'http%3A%2F%2F' + cmsDomain + '%2Fsites%2Fdefault%2Ffiles%2Fstyles%2Ffinder_image%2Fpublic%2Fgbif_project%2Fimages%2Forganizations%2Fflag_yellow_high.jpg"';
        expect(cmsUrlEncode.extractAndEncodeUriHtml(sourceUrl4)).toEqual(targetUrl4);
    });
});