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
        .state('omniSearch', {
            parent: 'localization',
            url: '/search?q',
            views: {
                main: {
                    templateUrl: '/templates/pages/search/search.html',
                    controller: 'searchCtrl',
                    controllerAs: 'omniSearch'
                }
            }
        })
        .state('occurrenceSearch', {
            parent: 'localization',
            url: '/occurrence?offset&limit&q&basisOfRecord&catalogNumber&collectionCode&continent&country&datasetKey&decimalLatitude&decimalLongitude&depth&elevation&eventDate&geometry&hasCoordinate&hasGeospatialIssue&institutionCode&issue&lastInterpreted&mediaType&month&occurrenceId&publishingCountry&recordedBy&recordNumber&scientificName&taxonKey&kingdomKey&phylumKey&classKey&orderKey&familyKey&genusKey&subGenusKey&speciesKey&year&establishmentMeans&repatriated&typeStatus&organismId&kingdomKey.facetLimit',
            views: {
                main: {
                    templateUrl: '/templates/pages/occurrence/occurrence.html',
                    controller: 'occurrenceCtrl',
                    controllerAs: 'occurrence'
                }
            },
            resolve: {
                results:  function($stateParams, OccurrenceTableSearch){
                    var query = angular.copy($stateParams);
                    return OccurrenceTableSearch.query(query).$promise;
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
            url: '/map?center&zoom',
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
        .state('datasetSearch', {
            parent: 'localization',
            url: '/dataset?offset&limit&q&type&keyword&publishing_org&hosting_org&publishing_country&decade',
            views: {
                main: {
                    templateUrl: '/templates/pages/dataset/search/dataset.html',
                    controller: 'datasetCtrl',
                    controllerAs: 'dataset'
                }
            },
            resolve: {
                results:  function($stateParams, DatasetSearch){
                    var query = angular.copy($stateParams);
                    var availableFacets = ['type', 'keyword', 'publishing_org', 'hosting_org', 'publishing_country'];
                    availableFacets.forEach(function(facet){
                        //if (angular.isUndefined(query[facet])) {
                            query.facet = query.facet || [];
                            query.facet.push(facet);
                        //}
                    });
                    return DatasetSearch.query(query).$promise;
                }
            }
        })
        .state('datasetSearchTable', {
            parent: 'datasetSearch',
            url: '/table',
            templateUrl: '/templates/pages/dataset/search/table/datasetTable.html',
            controller: 'datasetTableCtrl',
            controllerAs: 'datasetTable'
        })
        .state('cmsSearch', {
            parent: 'localization',
            url: '/cms?offset&limit&q&type&language&category_data_use&category_capacity_enhancement&category_about_gbif&category_audience&category_purpose&category_country&category_topic&category_resource_type',
            views: {
                main: {
                    templateUrl: '/templates/pages/about/search/cmsSearch.html',
                    controller: 'cmsSearchCtrl',
                    controllerAs: 'cms'
                }
            },
            resolve: {
                results:  function($stateParams, CmsSearch){
                    var query = angular.copy($stateParams);
                    return CmsSearch.query(query).$promise.then(function(response){
                        return response;
                    }, function(error){
                    'use strict';
                        return error;
                    });
                }
            }
        })
        .state('cmsSearchTable', {
            parent: 'cmsSearch',
            url: '/table',
            templateUrl: '/templates/pages/about/search/table/cmsTable.html',
            controller: 'cmsTableCtrl',
            controllerAs: 'cmsTable'
        })
    ;
    //if unknown route then go to server instead of redirecting to home: $urlRouterProvider.otherwise('/');

    //We do not support ie9 and browsers without history api https://docs.angularjs.org/error/$location/nobase
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false,
        rewriteLinks: false
    });
}

module.exports = routerConfig;

