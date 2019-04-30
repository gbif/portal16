'use strict';
var angular = require('angular');

require('angular-ui-router');

angular
    .module('portal')
    .config(routerConfig);

// The annotation is necessary to work with minification and ngAnnotate when using as a commonjs Module - http://chrisdoingweb.com/blog/minifying-browserified-angular-modules/
/** @ngInject */
function routerConfig($stateProvider, $locationProvider, BUILD_VERSION, LOCALE) {
    // TODO We need a way to handle routes when refreshing. Server needs to know about these routes.
    $stateProvider
        .state('localization', { // http://stackoverflow.com/questions/32357615/option-url-path-ui-router
            url: '/{locale:(?:' + LOCALE + ')}?qid',
            abstract: true,
            template: '<div ui-view="main" class="viewContentWrapper"></div>',
            params: {locale: {squash: true, value: 'en'}}
        })
        .state('omniSearch', {
            parent: 'localization',
            url: '/search?q',
            views: {
                main: {
                    templateUrl: '/templates/pages/search/search.html?v=' + BUILD_VERSION,
                    controller: 'searchCtrl',
                    controllerAs: 'rootSearch'
                }
            }
        })
        .state('occurrenceKey', {
            parent: 'localization',
            url: '/occurrence/{key:[0-9]+}',
            views: {
                main: {
                    templateUrl: '/templates/pages/occurrence/key/occurrenceKey.html?v=' + BUILD_VERSION,
                    controller: 'occurrenceKeyCtrl',
                    controllerAs: 'occurrenceKey',
                    resolve: {
                        occurrence: function($stateParams, Occurrence) {
                            return Occurrence.get({id: $stateParams.key}).$promise;
                        },
                        TRANSLATION_UNCERTAINTY: function($translate) {
                            return $translate('occurrence.coordinateUncertainty');
                        },
                        TRANSLATION_ELEVATION: function($translate) {
                            return $translate('ocurrenceFieldNames.elevation');
                        }
                    }
                }
            }
        })
        .state('occurrenceSearch', {
            parent: 'localization',
            // eslint-disable-next-line max-len
            url: '/occurrence?q&basis_of_record&catalog_number&collection_code&continent&country&dataset_key&decimal_latitude&decimal_longitude&depth&elevation&event_date&has_coordinate&has_geospatial_issue&institution_code&issue&last_interpreted&media_type&month&occurrence_id&publishing_country&publishing_org&recorded_by&record_number&scientific_name&taxon_key&kingdom_key&phylum_key&class_key&order_key&family_key&genus_key&sub_genus_key&species_key&year&establishment_means&type_status&organism_id&locality&water_body&state_province&protocol&license&repatriated&{advanced:bool}&geometry&event_id&parent_event_id&sampling_protocol&installation_key&network_key',
            params: {
                advanced: {
                    value: false,
                    squash: true
                },
                repatriated: {
                    type: 'string',
                    value: undefined,
                    squash: true,
                    array: false
                }
            },
            views: {
                main: {
                    templateUrl: '/templates/pages/occurrence/occurrence.html?v=' + BUILD_VERSION,
                    controller: 'occurrenceCtrl',
                    controllerAs: 'occurrence'
                }
            }
        })
        .state('occurrenceSearchTable', {
            parent: 'occurrenceSearch',
            url: '/search?offset&limit',
            templateUrl: '/templates/pages/occurrence/table/occurrenceTable.html?v=' + BUILD_VERSION,
            controller: 'occurrenceTableCtrl',
            controllerAs: 'occTable'
        })
        .state('occurrenceSearchMap', {
            parent: 'occurrenceSearch',
            url: '/map?center&zoom',
            templateUrl: '/templates/pages/occurrence/map/occurrenceMap.html?v=' + BUILD_VERSION,
            controller: 'occurrenceMapCtrl',
            controllerAs: 'occMap'
        })
        .state('occurrenceSearchGallery', {
            parent: 'occurrenceSearch',
            url: '/gallery',
            templateUrl: '/templates/pages/occurrence/gallery/occurrenceGallery.html?v=' + BUILD_VERSION,
            controller: 'occurrenceGalleryCtrl',
            controllerAs: 'occGallery'
        })
        .state('occurrenceSearchSpecies', {
            parent: 'occurrenceSearch',
            url: '/taxonomy',
            templateUrl: '/templates/pages/occurrence/species/occurrenceSpecies.html?v=' + BUILD_VERSION,
            controller: 'occurrenceSpeciesCtrl',
            controllerAs: 'occSpecies'
        })
        .state('occurrenceSearchDatasets', {
            parent: 'occurrenceSearch',
            url: '/datasets',
            templateUrl: '/templates/pages/occurrence/datasets/occurrenceDatasets.html?v=' + BUILD_VERSION,
            controller: 'occurrenceDatasetsCtrl',
            controllerAs: 'occDatasets'
        })
        .state('occurrenceSearchCharts', {
            parent: 'occurrenceSearch',
            url: '/charts?t&d&d2',
            templateUrl: '/templates/pages/occurrence/charts/occurrenceCharts.html?v=' + BUILD_VERSION,
            controller: 'occurrenceChartsCtrl',
            controllerAs: 'occCharts'
        })
        .state('occurrenceSearchDownload', {
            parent: 'occurrenceSearch',
            url: '/download',
            templateUrl: '/templates/pages/occurrence/download/occurrenceDownload.html?v=' + BUILD_VERSION,
            controller: 'occurrenceDownloadCtrl',
            controllerAs: 'occDownload'
        })
        .state('datasetSearch', {
            parent: 'localization',
            url: '/dataset?offset&limit&q&type&keyword&publishing_org&hosting_org&publishing_country&decade&taxon_key&project_id&license',
            views: {
                main: {
                    templateUrl: '/templates/pages/dataset/search/dataset.html?v=' + BUILD_VERSION,
                    controller: 'datasetCtrl',
                    controllerAs: 'dataset'
                }
            }
        })
        .state('datasetSearchTable', {
            parent: 'datasetSearch',
            url: '/search',
            templateUrl: '/templates/pages/dataset/search/table/datasetTable.html?v=' + BUILD_VERSION,
            controller: 'datasetTableCtrl',
            controllerAs: 'datasetTable'
        })
        .state('datasetKey', {
            parent: 'localization',
            url: '/dataset/:key',
            views: {
                main: {
                    templateUrl: '/api/template/dataset/key.html?v=' + BUILD_VERSION,
                    controller: 'datasetKeyCtrl',
                    controllerAs: 'datasetKey'
                }
            }
        })
        .state('datasetKeyActivity', {
            parent: 'datasetKey',
            url: '/activity?offset&limit',
            templateUrl: '/api/template/dataset/activity.html?v=' + BUILD_VERSION,
            controller: 'datasetActivityCtrl',
            controllerAs: 'datasetActivity'
        })
        .state('datasetKeyProject', {
            parent: 'datasetKey',
            url: '/project',
            templateUrl: '/api/template/dataset/project.html?v=' + BUILD_VERSION,
            controller: 'datasetProjectCtrl',
            controllerAs: 'datasetProject'
        })
        .state('datasetKeyStats', {
            parent: 'datasetKey',
            url: '/metrics',
            templateUrl: '/api/template/dataset/stats.html?v=' + BUILD_VERSION,
            controller: 'datasetStatsCtrl',
            controllerAs: 'datasetStats'
        })
        .state('datasetKeyConstituents', {
            parent: 'datasetKey',
            url: '/constituents?offset',
            templateUrl: '/api/template/dataset/constituents.html?v=' + BUILD_VERSION,
            controller: 'datasetConstituentsCtrl',
            controllerAs: 'datasetConstituents'
        })
        .state('datasetEvent', {
            parent: 'localization',
            url: '/dataset/:datasetKey/event/:eventKey',
            views: {
                main: {
                    templateUrl: '/api/template/dataset/event.html?v=' + BUILD_VERSION,
                    controller: 'datasetEventCtrl',
                    controllerAs: 'datasetEvent'
                }
            }
        })
        .state('datasetParentEvent', {
            parent: 'localization',
            url: '/dataset/:datasetKey/parentevent/:parentEventKey',
            views: {
                main: {
                    templateUrl: '/api/template/dataset/parentevent.html?v=' + BUILD_VERSION,
                    controller: 'datasetParentEventCtrl',
                    controllerAs: 'datasetParentEvent'
                }
            }
        })
        .state('speciesSearch', {
            parent: 'localization',
            url: '/species?offset&limit&q&rank&dataset_key&constituent_key&highertaxon_key&key&name_type&origin&qField&status&issue&{advanced:bool}',
            params: {
                advanced: {
                    value: false,
                    squash: true
                }
            },
            views: {
                main: {
                    templateUrl: '/templates/pages/species/search/species.html?v=' + BUILD_VERSION,
                    controller: 'speciesCtrl',
                    controllerAs: 'species'
                }
            }
        })
        .state('speciesSearchList', {
            parent: 'speciesSearch',
            url: '/search',
            templateUrl: '/templates/pages/species/search/list/speciesList.html?v=' + BUILD_VERSION,
            controller: 'speciesListCtrl',
            controllerAs: 'speciesList'
        })
        .state('speciesSearchTable', {
            parent: 'speciesSearch',
            url: '/table',
            templateUrl: '/templates/pages/species/search/table/speciesTable.html?v=' + BUILD_VERSION,
            controller: 'speciesTableCtrl',
            controllerAs: 'speciesTable'
        })
        .state('speciesKey', {
            parent: 'localization',
            url: '/species/:speciesKey?refOffset&occurrenceDatasetOffset&checklistDatasetOffset&root&vnOffset',
            params: {
                advanced: {
                    value: false,
                    squash: true
                }
            },
            views: {
                main: {
                    templateUrl: '/api/template/species/key.html?v=' + BUILD_VERSION,
                    controller: 'speciesKey2Ctrl',
                    controllerAs: 'speciesKey2'
                }
            }
        })
        .state('speciesKeyVerbatim', {
            parent: 'speciesKey',
            url: '/verbatim',
            params: {
                advanced: {
                    value: false,
                    squash: true
                }
            },
            views: {
                main: {
                    templateUrl: '/api/template/species/key.html?v=' + BUILD_VERSION,
                    controller: 'speciesKey2Ctrl',
                    controllerAs: 'speciesKey2'
                }
            }
        })
        .state('speciesKeyMetrics', {
            parent: 'speciesKey',
            url: '/metrics',
            views: {
                main: {
                    templateUrl: '/api/template/species/key.html?v=' + BUILD_VERSION,
                    controller: 'speciesKey2Ctrl',
                    controllerAs: 'speciesKey2'
                }
            }
        })
        .state('publisherSearch', {
            parent: 'localization',
            url: '/publisher?offset&limit&q&country',
            views: {
                main: {
                    templateUrl: '/templates/pages/publisher/search/publisher.html?v=' + BUILD_VERSION,
                    controller: 'publisherCtrl',
                    controllerAs: 'publisher'
                }
            }
        })
        .state('publisherSearchList', {
            parent: 'publisherSearch',
            url: '/search',
            templateUrl: '/templates/pages/publisher/search/list/publisherList.html?v=' + BUILD_VERSION,
            controller: 'publisherListCtrl',
            controllerAs: 'publisherList'
        })
        .state('publisherConfirmEndorsement', {
            url: '/publisher/confirm'

        })
        .state('publisherKey', {
            parent: 'localization',
            url: '/publisher/:key',
            views: {
                main: {
                    templateUrl: '/api/template/publisher/key.html?v=' + BUILD_VERSION,
                    controller: 'publisherKeyCtrl',
                    controllerAs: 'publisherKey'
                }
            }
        })
        .state('publisherMetrics', {
            parent: 'publisherKey',
            url: '/metrics',
            templateUrl: '/api/template/publisher/metrics.html?v=' + BUILD_VERSION,
            controller: 'publisherMetricsCtrl',
            controllerAs: 'publisherMetrics'
        })
        .state('resourceSearch', {
            parent: 'localization',
            // eslint-disable-next-line max-len
            url: '/resource?offset&limit&q&contentType&year&literatureType&language&audiences&purposes&topics&relevance&countriesOfResearcher&countriesOfCoverage&_showPastEvents&gbifDatasetKey&publishingOrganizationKey&gbifDownloadKey&peerReview&openAccess&projectId&contractCountry',
            views: {
                main: {
                    templateUrl: '/templates/pages/resource/search/resource.html?v=' + BUILD_VERSION,
                    controller: 'resourceCtrl',
                    controllerAs: 'resource'
                }
            }
        })
        .state('resourceSearchList', {
            parent: 'resourceSearch',
            url: '/search',
            templateUrl: '/templates/pages/resource/search/list/resourceList.html?v=' + BUILD_VERSION,
            controller: 'resourceListCtrl',
            controllerAs: 'resourceList'
        })
        .state('grscicoll', {
            parent: 'localization',
            url: '/grscicoll',
            views: {
                main: {
                    templateUrl: '/api/template/grscicoll/grscicoll.html?v=' + BUILD_VERSION,
                    controller: 'grscicollCtrl',
                    controllerAs: 'grscicoll'
                }
            }
        })
        .state('grscicollCollectionSearch', {
            parent: 'grscicoll',
            url: '/collection/search?q&offset',
            templateUrl: '/templates/pages/grscicoll/collection/collection.html?v=' + BUILD_VERSION,
            controller: 'grscicollCollectionCtrl',
            controllerAs: 'grscicollCollection'
        })
        .state('collectionKey', {
            parent: 'localization',
            url: '/grscicoll/collection/:key',
            views: {
                main: {
                    templateUrl: '/api/template/collection/key.html?v=' + BUILD_VERSION,
                    controller: 'collectionKeyCtrl',
                    controllerAs: 'collectionKey'
                }
            }
        })
        .state('grscicollInstitutionSearch', {
            parent: 'grscicoll',
            url: '/institution/search?q&offset',
            templateUrl: '/templates/pages/grscicoll/institution/institution.html?v=' + BUILD_VERSION,
            controller: 'grscicollInstitutionCtrl',
            controllerAs: 'grscicollInstitution'
        })
        .state('institutionKey', {
            parent: 'localization',
            url: '/grscicoll/institution/:key',
            views: {
                main: {
                    templateUrl: '/api/template/institution/key.html?v=' + BUILD_VERSION,
                    controller: 'institutionKeyCtrl',
                    controllerAs: 'institutionKey'
                }
            }
        })
        .state('grscicollPersonSearch', {
            parent: 'grscicoll',
            url: '/person/search?q&offset',
            templateUrl: '/templates/pages/grscicoll/person/person.html?v=' + BUILD_VERSION,
            controller: 'grscicollPersonCtrl',
            controllerAs: 'grscicollPerson'
        })
        .state('grscicollPersonKey', {
            parent: 'localization',
            url: '/grscicoll/person/:key',
            views: {
                main: {
                    templateUrl: '/api/template/grscicollPerson/key.html?v=' + BUILD_VERSION,
                    controller: 'grscicollPersonKeyCtrl',
                    controllerAs: 'grscicollPersonKey'
                }
            }
        })
        .state('contactUs', {
            parent: 'localization',
            url: '/contact-us',
            views: {
                main: {
                    templateUrl: '/api/template/contactUs/contactUs.html?v=' + BUILD_VERSION + '&locale=' + LOCALE,
                    controller: 'contactUsCtrl',
                    controllerAs: 'contactUs'
                }
            }
        })
        .state('contactDirectory', {
            parent: 'contactUs',
            url: '/directory?personId&group',
            templateUrl: '/api/template/contactUs/directory.html?v=' + BUILD_VERSION,
            controller: 'contactDirectoryCtrl',
            controllerAs: 'contactDirectory'
        })
        .state('faq', {
            parent: 'localization',
            url: '/faq?question&q',
            views: {
                main: {
                    templateUrl: '/api/template/faq.html?v=' + BUILD_VERSION,
                    controller: 'faqCtrl',
                    controllerAs: 'faq'
                }
            }
        })
        .state('user', {
            parent: 'localization',
            url: '/user',
            views: {
                main: {
                    templateUrl: '/templates/pages/user/user.html?v=' + BUILD_VERSION,
                    controller: 'userCtrl',
                    controllerAs: 'user'
                }
            }
        })
        .state('userProfile', {
            parent: 'user',
            url: '/profile',
            templateUrl: '/templates/pages/user/profile/userProfile.html?v=' + BUILD_VERSION,
            controller: 'userProfileCtrl',
            controllerAs: 'userProfile'
        })
        .state('userDownloads', {
            parent: 'user',
            url: '/download?offset&limit',
            templateUrl: '/templates/pages/user/downloads/userDownloads.html?v=' + BUILD_VERSION,
            controller: 'userDownloadsCtrl',
            controllerAs: 'userDownloads'
        })
        .state('userSettings', {
            parent: 'user',
            url: '/settings',
            templateUrl: '/templates/pages/user/settings/userSettings.html?v=' + BUILD_VERSION,
            controller: 'userSettingsCtrl',
            controllerAs: 'userSettings'
        })
        .state('node', {
            parent: 'localization',
            url: '/node/:key?offset_datasets&offset_endorsed',
            views: {
                main: {
                    templateUrl: '/api/template/node/key.html?v=' + BUILD_VERSION,
                    controller: 'nodeKeyCtrl',
                    controllerAs: 'nodeKey'
                }
            }
        })
        .state('participant', {
            parent: 'localization',
            url: '/participant/:key?offset_datasets&offset_endorsed',
            views: {
                main: {
                    templateUrl: '/api/template/participant/key.html?v=' + BUILD_VERSION,
                    controller: 'participantKeyCtrl',
                    controllerAs: 'participantKey'
                }
            }
        })
        .state('installation', {
            parent: 'localization',
            url: '/installation/:key?offset',
            views: {
                main: {
                    templateUrl: '/templates/pages/installation/key/installationKey.html?v=' + BUILD_VERSION,
                    controller: 'installationKeyCtrl',
                    controllerAs: 'installationKey'
                }
            }
        })
        .state('network', {
            parent: 'localization',
            url: '/network/:key',
            views: {
                main: {
                    templateUrl: '/api/template/network.html?v=' + BUILD_VERSION,
                    controller: 'networkKeyCtrl',
                    controllerAs: 'networkKey'
                }
            }
        })
        .state('networkDataset', {
            parent: 'network',
            url: '/dataset?offset',
            templateUrl: '/templates/pages/network/key/dataset/networkDataset.html?v=' + BUILD_VERSION,
            controller: 'networkDatasetCtrl',
            controllerAs: 'networkDataset'
        })
        .state('networkMetrics', {
            parent: 'network',
            url: '/metrics',
            templateUrl: '/templates/pages/network/key/metrics/networkMetrics.html?v=' + BUILD_VERSION,
            controller: 'networkMetricsCtrl',
            controllerAs: 'networkMetrics'
        })
        // end comment in
        .state('country', {
            parent: 'localization',
            url: '/country/:key',
            views: {
                main: {
                    templateUrl: '/api/template/country.html?v=' + BUILD_VERSION,
                    controller: 'countryKeyCtrl',
                    controllerAs: 'countryKey'
                }
            }
        })
        .state('countrySummary', {
            parent: 'country',
            url: '/summary',
            templateUrl: '/api/template/country/summary.html?v=' + BUILD_VERSION,
            controller: 'countrySummaryCtrl',
            controllerAs: 'countrySummary'
        })
        .state('countryAbout', {
            parent: 'country',
            url: '/about',
            templateUrl: '/api/template/country/about.html?v=' + BUILD_VERSION,
            controller: 'countryAboutCtrl',
            controllerAs: 'countryAbout'
        })
        .state('countryPublishing', {
            parent: 'country',
            url: '/publishing',
            templateUrl: '/api/template/country/publishing.html?v=' + BUILD_VERSION,
            controller: 'countryPublishingCtrl',
            controllerAs: 'countryPublishing'
        })
        .state('countryParticipation', {
            parent: 'country',
            url: '/participation',
            templateUrl: '/api/template/country/participation.html?v=' + BUILD_VERSION,
            controller: 'countryParticipationCtrl',
            controllerAs: 'countryParticipation'
        })
        .state('countryResearch', {
            parent: 'country',
            url: '/publications',
            templateUrl: '/api/template/country/publications.html?v=' + BUILD_VERSION,
            controller: 'countryResearchCtrl',
            controllerAs: 'countryResearch'
        })
        .state('health', {
            parent: 'localization',
            url: '/health',
            views: {
                main: {
                    templateUrl: '/templates/pages/health/health.html?v=' + BUILD_VERSION,
                    controller: 'healthCtrl',
                    controllerAs: 'health'
                }
            }
        })
        .state('theGbifNetwork', {
            parent: 'localization',
            url: '/the-gbif-network/:region?',
            params: {region: {squash: true, value: 'global'}},
            views: {
                main: {
                    templateUrl: '/templates/pages/theGbifNetwork/theGbifNetwork.html?v=' + BUILD_VERSION,
                    controller: 'theGbifNetworkCtrl',
                    controllerAs: 'vm'
                }
            }
        })
        .state('dataValidator', {
            parent: 'localization',
            url: '/tools/data-validator',
            views: {
                main: {
                    templateUrl: '/api/template/tools/dataValidator.html?v=' + BUILD_VERSION,
                    controller: 'dataValidatorCtrl',
                    controllerAs: 'vm'
                }
            }
        })
        .state('dataValidatorAbout', {
            parent: 'dataValidator',
            url: '/about',
            templateUrl: '/api/template/tools/dataValidator/about.html?v=' + BUILD_VERSION,
            controller: 'dataValidatorAboutCtrl',
            controllerAs: 'dataValidatorAbout'
        })
        // .state('dataValidatorExtensions', {
        //     parent: 'dataValidator',
        //     url: '/extensions/:jobid?',
        //     templateUrl: '/api/template/tools/dataValidator/extensions.html?v=' + BUILD_VERSION,
        //     controller: 'dwcExtensionsCtrl',
        //     controllerAs: 'vm'
        // })
        .state('dataValidatorKey', {
            parent: 'localization',
            url: '/tools/data-validator/:jobid',
            views: {
                main: {
                    templateUrl: '/api/template/tools/dataValidatorKey.html?v=' + BUILD_VERSION,
                    controller: 'dataValidatorKeyCtrl',
                    controllerAs: 'vm'
                }
            }
        })
        .state('dataValidatorExtensionsKey', {
            parent: 'dataValidatorKey',
            url: '/extensions',
            templateUrl: '/api/template/tools/dataValidator/extensions.html?v=' + BUILD_VERSION,
            controller: 'dwcExtensionsCtrl',
            controllerAs: 'vm'
        })
        // .state('dataValidatorAboutKey', {
        //     parent: 'dataValidatorKey',
        //     url: '/about',
        //     templateUrl: '/api/template/tools/dataValidator/about.html?v=' + BUILD_VERSION,
        //     controller: 'dataValidatorAboutCtrl',
        //     controllerAs: 'dataValidatorAbout'
        // })
        .state('dataValidatorKeyDocument', {
            parent: 'dataValidatorKey',
            url: '/document',
            templateUrl: '/api/template/tools/dataValidator/document.html?v=' + BUILD_VERSION,
            controller: 'dataValidatorDocumentCtrl',
            controllerAs: 'vm'
        })


        .state('dataRepository', {
            parent: 'localization',
            url: '/data-repository',
            views: {
                main: {
                    templateUrl: '/api/template/tools/dataRepository.html?v=' + BUILD_VERSION,
                    controller: 'dataRepositoryCtrl',
                    controllerAs: 'dataRepository'
                }
            }
        })
        .state('dataRepositoryUpload', {
            parent: 'dataRepository',
            url: '/upload',
            templateUrl: '/api/template/tools/dataRepository/upload.html?v=' + BUILD_VERSION,
            controller: 'dataRepositoryUploadCtrl',
            controllerAs: 'dataRepositoryUpload'
        })
        .state('dataRepositoryAbout', {
            parent: 'dataRepository',
            url: '/about',
            templateUrl: '/api/template/tools/dataRepository/about.html?v=' + BUILD_VERSION,
            controller: 'dataRepositoryAboutCtrl',
            controllerAs: 'dataRepositoryAbout'
        })
        .state('dataRepositoryKey', {
            parent: 'localization',
            url: '/data-repository/upload/:key',
            views: {
                main: {
                    templateUrl: '/api/template/tools/dataRepository/key.html?v=' + BUILD_VERSION,
                    controller: 'dataRepositoryKeyCtrl',
                    controllerAs: 'dataRepositoryKey'
                }
            }
        })
    ;

    // if unknown route then go to server instead of redirecting to home: $urlRouterProvider.otherwise('/');

    // We do not support ie9 and browsers without history api https://docs.angularjs.org/error/$location/nobase
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false,
        rewriteLinks: false
    });
    $locationProvider.hashPrefix('!');
}

module.exports = routerConfig;

