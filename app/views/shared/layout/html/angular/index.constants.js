(function() {
    'use strict';
    var angular = require('angular');
    var env = window.gb.env;
    require('./env.constants');

    angular
        .module('portal')
        .constant('endpoints', {
            download: '/api/user/download',
            predicate: '/api/occurrence/search/predicate',
            sqlDownload: '/api/user/download/sql',
            cancelDownload: '/api/user/cancelDownload/',
            iucnUserLink: 'http://www.iucnredlist.org/details/',
            userDownloads: '/api/user/myDownloads',
            datasetDownloads: 'occurrence/download/dataset/',
            webUtils: env.webUtils
        });
})();
