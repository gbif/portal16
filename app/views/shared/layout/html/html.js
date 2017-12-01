require('./polyfills/polyfills');

//Create a global GBIF Object
(function (global) {
    var gb = global.gb || {},
        util = {VERSION: '0.0.1'};
    gb.util = util;
    global.gb = gb;
})(window);


//Small test to add a class if it is a touch device. Will not catch all devices, so only use as a supplement. See http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
window.gb = window.gb || {};
window.gb.supportsTouch = !!('ontouchstart' in window || navigator.msMaxTouchPoints);
if (window.gb.supportsTouch) {
    document.body.classList.add('isTouch'); //could be useful to have in stylesheet. for example to make targets larger on touch devices
}

var angular = require('angular');
//require('./errorLogging'); //TODO temporarily disabled as it isn't tested for DOS and stability
require('angular-ui-router');
require('angular-translate');
require('angular-moment');
require('angular-leaflet-directive');
window.L = L;
require('angular-hotkeys');
require('angular-resource');
require('angular-aria');
require('angular-ui-bootstrap');
require('ng-infinite-scroll');
require('angular-scroll');
require('angular-sanitize');
require('../../../components/clickoutside/clickoutside.directive');
require('nouislider-angular');
window.Chartist = require('chartist');
require('angular-chartist.js');
require('chartist-plugin-axistitle');
require('ngstorage');
require('angular-cookies');
require('angular-messages');
require('angular-toastr');
require('angular-animate');
require('angular-material');
require('ng-file-upload');

require('chartjs');
require('angular-chart.js');


require('checklist-model');//TODO remove as we hardly use it now that there is continous update on occurrenece search?

require('angular-svg-round-progressbar');

(function () {
    'use strict';
    angular
        .module('portal', ['ngMaterial', 'ngAnimate', 'chart.js', 'ngMessages', 'ngCookies', 'ngStorage', 'ngAria', 'ui.router', 'pascalprecht.translate', 'leaflet-directive', 'angularMoment', 'cfp.hotkeys', 'ngResource', 'ui.bootstrap', 'infinite-scroll', 'gb-click-outside', 'duScroll', 'ngSanitize', 'checklist-model', 'ya.nouislider', 'angular-chartist', 'angular-svg-round-progressbar', 'toastr', 'ngFileUpload']);
})();

(function () {
    'use strict';
    angular
        .module('portal')
        .run(runBlock)
        .config(configBlock)
        .config(mdTheming)
        .config(chartjsConfig);

    /** @ngInject */
    function runBlock(amMoment, $translate, $http, LOCALE, $rootScope) { //$log
        //$log.debug('runBlock end');
        $translate.use(LOCALE);
        amMoment.changeLocale(LOCALE);

        $http({
            method: 'GET',
            url: '//timrobertson100.carto.com/api/v1/map?stat_tag=API&config=%7B%22version%22%3A%221.3.0%22%2C%22stat_tag%22%3A%22API%22%2C%22layers%22%3A%5B%7B%22type%22%3A%22cartodb%22%2C%22options%22%3A%7B%22sql%22%3A%22SELECT%20ST_SCALE(the_geom%2C%20111319.44444444444444%2C%20111319.44444444444444)%20AS%20the_geom_webmercator%20FROM%20world_borders_hd_copy%22%2C%22cartocss%22%3A%22%23layer%20%7B%20polygon-fill%3A%20%234D5258%3B%20polygon-opacity%3A%201%3B%20line-width%3A0%7D%22%2C%22cartocss_version%22%3A%222.1.0%22%7D%7D%5D%7D'
        });

        $rootScope.$on('$stateChangeStart', function(e) {
            if (window.gb.state > 399) {
                e.preventDefault();
            }
        });
    }

    ///** @ngInject */
    //function addStateToRoot($rootScope,   $state,   $stateParams) {
    //    // It's very handy to add references to $state and $stateParams to the $rootScope
    //    // so that you can access them from any scope within your applications.For example,
    //    // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
    //    // to active whenever 'contacts.list' or one of its decendents is active.
    //    $rootScope.$state = $state;
    //    $rootScope.$stateParams = $stateParams;
    //}

    /** @ngInject */
    function configBlock($localStorageProvider, $sessionStorageProvider, toastrConfig, $compileProvider) {

        $localStorageProvider.setKeyPrefix('gbif.');
        $sessionStorageProvider.setKeyPrefix('gbif.');
        // localStorageServiceProvider
        //     .setPrefix('gbif')
        //     .setStorageType('localStorage')
        //     .setDefaultToCookie(false);



        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|webcal):/);



        angular.extend(toastrConfig, {
            autoDismiss: false,
            containerId: 'toast-container',
            maxOpened: 3,
            progressBar: true,
            newestOnTop: true,
            positionClass: 'toast-bottom-right',
            preventDuplicates: false,
            preventOpenDuplicates: true,
            tapToDismiss: true,
            target: 'body',
            timeOut: "10000",
            extendedTimeOut: "3000"
        });
    }

    /** @ngInject */
    function chartjsConfig(ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            //chartColors: ['#61a861', '#803690', '#FF8A80'],
            chartColors: [
                {
                    backgroundColor: '#61a861',
                    borderColor: '#61a861',
                    hoverBackgroundColor: '#56bb54',
                    hoverBorderColor: '#56bb54'
                },
                {
                    backgroundColor: '#65C6BB',
                    borderColor: '#65C6BB',
                    hoverBackgroundColor: '#65C6BB',
                    hoverBorderColor: '#65C6BB'
                },
                {
                    backgroundColor: '#1BBC9B',
                    borderColor: '#1BBC9B',
                    hoverBackgroundColor: '#1BBC9B',
                    hoverBorderColor: '#1BBC9B'
                }
            ],
            responsive: true
        });
        // Configure all line charts
        ChartJsProvider.setOptions('line', {
            showLines: true
        });
        //ChartJsProvider.setOptions({ colors : [ '#803690', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'] });
    }

    /** @ngInject */
    function mdTheming($mdThemingProvider) {
        //build with https://angular-md-color.com/#/ based on menu green. plum and tomato
        var customPrimary = {
            '50': '#b3d5b3',
            '100': '#a3cca3',
            '200': '#92c392',
            '300': '#82ba82',
            '400': '#71b171',
            '500': '#61a861',
            '600': '#559a55',
            '700': '#4c8a4c',
            '800': '#437a43',
            '900': '#3a693a',
            'A100': '#c4dec4',
            'A200': '#d4e7d4',
            'A400': '#e5f0e5',
            'A700': '#315931',
            'contrastDefaultColor': 'light',    // whether, by default, text (contrast) on this palette should be dark or light
            'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'] //hues which contrast should be 'dark' by default
        };
        $mdThemingProvider
            .definePalette('customPrimary',
                customPrimary);

        var customAccent = {
            '50': '#313252',
            '100': '#3a3c62',
            '200': '#444572',
            '300': '#4d4f82',
            '400': '#575992',
            '500': '#6163a2',
            '600': '#8183b4',
            '700': '#9193be',
            '800': '#a1a2c7',
            '900': '#b1b2d1',
            'A100': '#8183b4',
            'A200': '#7173ab',
            'A400': '#6163a2',
            'A700': '#c1c2da',
            'contrastDefaultColor': 'light',    // whether, by default, text (contrast) on this palette should be dark or light
            'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'] //hues which contrast should be 'dark' by default
        };
        $mdThemingProvider
            .definePalette('customAccent',
                customAccent);

        var customWarn = {
            '50': '#ffcfc6',
            '100': '#ffb9ad',
            '200': '#ffa493',
            '300': '#ff8e7a',
            '400': '#ff7960',
            '500': '#ff6347',
            '600': '#ff4d2d',
            '700': '#ff3814',
            '800': '#f92600',
            '900': '#e02200',
            'A100': '#ffe5e0',
            'A200': '#fffaf9',
            'A400': '#ffffff',
            'A700': '#c61e00',
            'contrastDefaultColor': 'light',    // whether, by default, text (contrast) on this palette should be dark or light
            'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'] //hues which contrast should be 'dark' by default
        };
        $mdThemingProvider
            .definePalette('customWarn',
                customWarn);

        var customBackground = {
            '50': '#ffffff',
            '100': '#ffffff',
            '200': '#ffffff',
            '300': '#ffffff',
            '400': '#ffffff',
            '500': '#f7f9fa',
            '600': '#e7edf0',
            '700': '#d8e1e6',
            '800': '#c8d6dd',
            '900': '#b8cad3',
            'A100': '#ffffff',
            'A200': '#ffffff',
            'A400': '#ffffff',
            'A700': '#a9bec9'
        };
        $mdThemingProvider
            .definePalette('customBackground',
                customBackground);

        $mdThemingProvider.theme('default')
            .primaryPalette('customPrimary')
            .accentPalette('customAccent')
            .warnPalette('customWarn')
            .backgroundPalette('customBackground')

    }


})();
require('./portal.ctrl');
require('../partials/head/head.ctrl');
require('../partials/head/page.factory');

//require('./angular/socket.factory');//turns out this scales really badly or at least it didn't scale out of the box. Going back to ajax polling

require('./angular/index.constants');
require('./angular/routerConfig');

require('./angular/index.filters');
require('./angular/occurrence.resource');
require('./angular/dataset.resource');
require('./angular/cms.resource');
require('./angular/dbpedia.resource');
require('./angular/redlist.resource');
require('./angular/cites.resource');
require('./angular/directory.resource');
require('./angular/species.resource');
require('./angular/taxonomy.resource');
require('./angular/map.resource');
require('./angular/dwcextension.resource');
require('./angular/similarOccurrence.service');
require('./angular/occurrenceFilter.service');
require('./angular/datasetFilter.service');
require('./angular/speciesFilter.service');
require('./angular/toast.service');
require('./angular/map.constants');
require('./angular/enums.constants');
require('./angular/country.resource');
require('./angular/node.resource');
require('./angular/installation.resource');
require('./angular/network.resource');
require('./angular/resource.resource');
require('./angular/resourceFilter.service');
require('./angular/contentFulResource.resource');

require('./angular/directives/onLoad/onload.directive');
require('./angular/directives/helpDesk.directive');

require('../partials/userMenu/userMenu.directive');
require('../partials/menuSearch/menuSearch.directive');
require('../partials/feedback/feedback.directive');
require('../partials/notifications/notifications.directive');

require('./angular/nav.constants');
require('../partials/navigation/nav.ctrl');
require('../partials/popups/terms/terms.directive');


require('../../../pages/search/search.ctrl');

require('../../../pages/occurrence/key/occurrenceKey.ctrl');
require('../../../pages/occurrence/occurrence.ctrl');
require('../../../pages/occurrence/table/occurrenceTable.ctrl');
require('../../../pages/occurrence/gallery/occurrenceGallery.ctrl');
require('../../../pages/occurrence/map/occurrenceMap.ctrl');
require('../../../pages/occurrence/species/occurrenceSpecies.ctrl');
require('../../../pages/occurrence/datasets/occurrenceDatasets.ctrl');
require('../../../pages/occurrence/download/occurrenceDownload.ctrl');

require('../../../pages/node/key/nodeKey.ctrl');
require('../../../pages/installation/key/installationKey.ctrl');
require('../../../pages/network/key/networkKey.ctrl');

require('../../../components/gbHelp/gbHelp.directive');
require('../../../pages/tools/speciesLookup/droppable.directive');


require('../../../components/userLogin/userLogin.directive');
require('../../../pages/user/updatePassword/updatePassword.ctrl');
require('../../../pages/user/profile/userProfile.ctrl');
require('../../../pages/user/downloads/userDownloads.ctrl');
require('../../../pages/user/settings/userSettings.ctrl');
require('../../../pages/user/user.ctrl');
require('../../../pages/user/confirmUser/confirmUser.ctrl');

require('../../../pages/occurrence/download/key/occurrenceDownload.ctrl');

require('../../../pages/species/key/speciesKey.ctrl');
require('../../../pages/species/key2/speciesKey.ctrl');
require('../../../pages/species/key2/references/references.ctrl');

require('../../../pages/dataset/search/dataset.ctrl');
require('../../../pages/dataset/search/table/datasetTable.ctrl');

require('../../../pages/tools/suggestDataset/suggestDataset.ctrl');
require('../../../pages/custom/becomePublisher/becomePublisher.ctrl');

require('../../../pages/dataset/key/datasetKey.ctrl');

//cms data is gathered under the umbrella term resources
require('../../../pages/resource/search/resource.ctrl');
require('../../../pages/resource/search/list/resourceList.ctrl');

require('./angular/cmsFilter.service');
require('../../../pages/cms/search/cms.ctrl');
require('../../../pages/cms/search/table/cmsTable.ctrl');
require('../../../pages/about/directory/directory.ctrl');
require('../../../pages/theGbifNetwork/theGbifNetwork.ctrl');

require('../../../pages/participant/country/countryKey.ctrl');
require('../../../pages/participant/participant/participantKey.ctrl');

require('../../../pages/resource/key/programme/programme.ctrl');
require('../../../pages/resource/key/project/project.ctrl');

require('../../../pages/custom/contactUs/contactUs.ctrl');
require('../../../pages/custom/contactUs/directory/contactDirectory.ctrl');

require('../../../pages/custom/faq/faq.ctrl');

require('../../../pages/health/health.ctrl');

require('../../../pages/tools/dataValidator/dataValidator.ctrl');
require('../../../pages/tools/dataValidator/dataValidatorKey.ctrl');

require('../../../pages/tools/dataValidator/document/dataValidatorDocument.ctrl');
require('../../../pages/tools/dataValidator/about/dataValidatorAbout.ctrl');
require('../../../pages/tools/dataValidator/extensions/dwcExtensions.ctrl');



require('./angular/publisher.resource');
require('./angular/publisherFilter.service');
require('./angular/remarks.service');
require('../../../pages/publisher/search/publisher.ctrl');
require('../../../pages/publisher/search/list/publisherList.ctrl');
require('../../../pages/publisher/key/publisherKey.ctrl');

require('../../../pages/species/search/species.ctrl');
require('../../../pages/species/search/table/speciesTable.ctrl');
require('../../../pages/species/search/list/speciesList.ctrl');

require('../../../components/map/basic/gbmap.directive');
require('../../../components/map/mapWidget/mapWidget.directive');//TODO decide on a map
require('../../../components/suggest/suggest.directive');
require('../../../components/expand/expand.directive');
require('../../../components/shorten/shorten.directive');
require('../../../components/fab/fab.directive');
require('../../../components/searchDrawer/searchDrawer.directive');
require('../../../components/enumFilter/enumFilter.directive');
require('../../../components/filterTaxon/filterTaxon.directive');
require('../../../components/filterSuggest/filterSuggest.directive');
require('../../../components/filterLocation/filterLocation.directive');
require('../../../components/filterLocation/filterLocationMap.directive');
require('../../../components/filterLocation/bboxFilter/bboxFilter.directive');
require('../../../components/filterInterval/filterInterval.directive');
require('../../../components/filterFacet/filterFacet.directive');

require('../../../components/filterFacetedEnum/filterFacetedEnum.directive');
require('../../../components/count/count.directive');
require('../../../components/asyncIf/asyncIf.directive');
require('../../../components/elementQuery/elementQuery.directive');
require('../../../components/taxonImg/taxonImg.directive');
require('../../../components/taxonImg/taxonOccImg.directive');


require('../../../components/filterEnum/filterEnum.directive');
require('../../../components/filterTernary/filterTernary.directive');
require('../../../components/filterDate/filterDate.directive');
require('../../../components/filterCms/filterCms.directive');

require('../../../components/focusMe/focusMe.directive');

require('./angular/translate');

var isIE = require('./ieDetection.js')();
if (isIE) {
    document.body.className += 'IE IE' + isIE;
}

