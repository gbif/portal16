var angular = require('angular');
require('angular-ui-router'); 
angular
    .module('portal')
    .config(routerConfig);
    
// The annotation is necessary to work with minification and ngAnnotate when using as a commonjs Module - http://chrisdoingweb.com/blog/minifying-browserified-angular-modules/
/** @ngInject */
function routerConfig($stateProvider, $locationProvider) {
    //TODO We need a way to handle routes when refreshing. Server needs to know about these routes.
    $stateProvider
        .state('localization', { // http://stackoverflow.com/questions/32357615/option-url-path-ui-router
            url: '/{locale:(?:en|da)}',
            abstract: true,
            template: '<div ui-view="main" class="viewContentWrapper"></div>',
            params: {locale : { squash : true, value: 'en' }}
        })
        .state('testerpage', {
            url: '/tester',
            templateUrl: '/templates/shared/layout/main/main.html',
            controller: 'MainController',
            controllerAs: 'main'
        })
        .state('occurrenceSearch', {
            parent: 'localization',
            url: '/occurrence?offset&basisOfRecord&eventDate&taxonKey&q&key&kingdomKey.facetLimit',
            views: {
                main: {
                    templateUrl: '/templates/pages/occurrence/occurrence.html',
                    controller: 'occurrenceCtrl',
                    controllerAs: 'occurrence'
                }
            }
        })
        .state('occurrenceSearchTable', {
            parent: 'occurrenceSearch',
            url: '/table',
            templateUrl: '/templates/pages/occurrence/table/occurrenceTable.html',
            controller: 'occurrenceTableCtrl',
            controllerAs: 'occTable'
        })
        .state('occurrenceSearchMap', {
            parent: 'occurrenceSearch',
            url: '/map',
            templateUrl: '/templates/pages/occurrence/map/occurrenceMap.html',
            controller: 'occurrenceMapCtrl',
            controllerAs: 'occMap'
        })
        .state('occurrenceSearchGallery', {
            parent: 'occurrenceSearch',
            url: '/gallery',
            templateUrl: '/templates/pages/occurrence/gallery/occurrenceGallery.html',
            controller: 'occurrenceGalleryCtrl',
            controllerAs: 'occGallery'
        })
    ;
    //if unknown route then goto server instead of redirecting to home: $urlRouterProvider.otherwise('/');

    //TODO how does this work with ie9 and browsers without history api https://docs.angularjs.org/error/$location/nobase
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false,
        rewriteLinks: false
    });
}

module.exports = routerConfig;

