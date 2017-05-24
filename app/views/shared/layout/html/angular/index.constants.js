(function () {
    'use strict';
    var angular = require('angular');
    require('./env.constants');

    angular
        .module('portal')
        .constant('constantKeys', {
            backboneKey: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c',
            col: '7ddf754f-d193-4cc9-b351-99906754a03b'
        }).constant('endpoints', {
            download: '/api/user/download',
            iucnUserLink: 'http://www.iucnredlist.org/details/',
            userDownloads: '/api/user/myDownloads',
            datasetDownloads: 'occurrence/download/dataset/'
        })
})();
