'use strict';
var angular = require('angular');
var _ = require('lodash');
require('./table/occurrenceTable.ctrl');
require('./gallery/occurrenceGallery.ctrl');
require('./map/occurrenceMap.ctrl');
require('./species/occurrenceSpecies.ctrl');
require('./datasets/occurrenceDatasets.ctrl');
require('./download/occurrenceDownload.ctrl');
require('./charts/occurrenceCharts.ctrl');
require('../../components/occurrenceBreakdown/occurrenceBreakdown.directive');

angular
  .module('portal')
  .controller('occurrenceCtrl', occurrenceCtrl);

/** @ngInject */
// eslint-disable-next-line max-len
function occurrenceCtrl($scope, $state, $window, hotkeys, enums, LifeStage, OccurrenceSearch, OccurrenceFilter, suggestEndpoints, Species, Dataset, Network, Collection, Institution, SpeciesMatch, $filter, Page, BUILD_VERSION, Publisher, Gadm, $translate) {
  var vm = this;
  $translate('occurrenceSearch.title').then(function (title) {
    Page.setTitle(title);
  });
  Page.drawer(true);
  vm.occurrenceState = OccurrenceFilter.getOccurrenceData();

  vm.filters = {};
  // enums
  vm.filters.typeStatus = {
    titleTranslation: 'filterNames.typeStatus',
    queryKey: 'type_status',
    filter: OccurrenceFilter,
    enumTranslationPath: 'typeStatus.',
    showAll: true,
    enums: enums.typeStatus,
    reversible: true,
    facets: {
      hasFacets: true,
      facetKey: 'TYPE_STATUS'
    }
  };

  vm.filters.issue = {
    titleTranslation: 'filterNames.issue',
    queryKey: 'issue',
    filter: OccurrenceFilter,
    enumTranslationPath: 'occurrenceIssue.',
    showAll: true,
    enums: enums.occurrenceIssue,
    reversible: true,
    facets: {
      hasFacets: true,
      facetKey: 'ISSUE'
    }
  };

  vm.filters.dwcaExtension = {
    titleTranslation: 'filterNames.dwcaExtension',
    queryKey: 'dwca_extension',
    filter: OccurrenceFilter,
    enumTranslationPath: 'dwcaExtension.',
    showAll: true,
    enums: enums.dwcaExtension,
    reversible: false,
    facets: {
      hasFacets: true,
      facetKey: 'DWCA_EXTENSION'
    }
  };

  vm.filters.mediaType = {
    titleTranslation: 'filterNames.mediaType',
    queryKey: 'media_type',
    filter: OccurrenceFilter,
    enumTranslationPath: 'mediaType.',
    showAll: true,
    enums: enums.mediaType,
    facets: {
      hasFacets: true,
      facetKey: 'MEDIA_TYPE'
    }
  };

  vm.filters.establishmentMeans = {
    titleTranslation: 'filterNames.establishmentMeans',
    queryKey: 'establishment_means',
    filter: OccurrenceFilter,
    enumTranslationPath: 'establishmentMeans.',
    showAll: true,
    enums: enums.establishmentMeans,
    reversible: true,
    facets: {
      hasFacets: true,
      facetKey: 'ESTABLISHMENT_MEANS'
    }
  };

  vm.filters.continent = {
    titleTranslation: 'filterNames.continent',
    queryKey: 'continent',
    filter: OccurrenceFilter,
    enumTranslationPath: 'continent.',
    showAll: true,
    enums: enums.continent,
    reversible: true,
    facets: {
      hasFacets: true,
      facetKey: 'CONTINENT'
    }
  };

  vm.filters.license = {
    titleTranslation: 'filterNames.license',
    queryKey: 'license',
    filter: OccurrenceFilter,
    enumTranslationPath: 'license.',
    showAll: true,
    enums: enums.license,
    facets: {
      hasFacets: true,
      facetKey: 'LICENSE'
    }
  };

  // suggest filters

  vm.filters.recordedBy = {
    titleTranslation: 'filterNames.recordedBy',
    queryKey: 'recorded_by',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.recordedBy
    },
    facets: {
      facetKey: 'RECORDED_BY'
    }
  };

  vm.filters.identifiedBy = {
    titleTranslation: 'filterNames.identifiedBy',
    queryKey: 'identified_by',
    filter: OccurrenceFilter,
    search: {
        isSearchable: true,
        suggestEndpoint: suggestEndpoints.identifiedBy
    }
  };

  vm.filters.recordedById = {
    titleTranslation: 'filterNames.recordedById',
    queryKey: 'recorded_by_id',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true
    }
  };

  vm.filters.identifiedById = {
    titleTranslation: 'filterNames.identifiedById',
    queryKey: 'identified_by_id',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true
    }
  };

  vm.filters.occurrenceId = {
    titleTranslation: 'filterNames.occurrenceId',
    queryKey: 'occurrence_id',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.occurrenceId
    },
    facets: {
      hasFacets: false,
      facetKey: 'OCCURRENCE_ID'
    }
  };

  vm.filters.recordNumber = {
    titleTranslation: 'filterNames.recordNumber',
    queryKey: 'record_number',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.recordNumber
    },
    facets: {
      hasFacets: false,
      facetKey: 'RECORD_NUMBER'
    }
  };

  vm.filters.organismId = {
    titleTranslation: 'filterNames.organismId',
    queryKey: 'organism_id',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.organismId
    },
    facets: {
      hasFacets: false,
      facetKey: 'ORGANISM_ID'
    }
  };

  vm.filters.catalogNumber = {
    titleTranslation: 'filterNames.catalogNumber',
    queryKey: 'catalog_number',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.catalogNumber
    },
    facets: {
      hasFacets: false,
      facetKey: 'CATALOG_NUMBER'
    },
    focusFirst: false
  };

  vm.filters.locality = {
    titleTranslation: 'filterNames.locality',
    queryKey: 'locality',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.locality
    },
    facets: {
      hasFacets: false,
      facetKey: 'LOCALITY'
    }
  };

  vm.filters.waterBody = {
    titleTranslation: 'filterNames.waterBody',
    queryKey: 'water_body',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.waterBody
    },
    facets: {
      hasFacets: false,
      facetKey: 'WATER_BODY'
    }
  };

  vm.filters.stateProvince = {
    titleTranslation: 'filterNames.stateProvince',
    queryKey: 'state_province',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.stateProvince
    },
    facets: {
      hasFacets: false,
      facetKey: 'STATE_PROVINCE'
    }
  };

  vm.filters.institutionCode = {
    titleTranslation: 'filterNames.institutionCode',
    queryKey: 'institution_code',
    filter: OccurrenceFilter,
    facets: {
      hasFacets: true,
      facetKey: 'INSTITUTION_CODE'
    },
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.institutionCode
    }
  };

  vm.filters.collectionCode = {
    titleTranslation: 'filterNames.collectionCode',
    queryKey: 'collection_code',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true
    }
  };

  // enums 2
  vm.filters.countryCode = {
    titleTranslation: 'filterNames.country',
    queryKey: 'country',
    filter: OccurrenceFilter,
    enumTranslationPath: 'country.',
    reversible: false,
    search: {
      isSearchable: true,
      suggestEndpoint: '/api/country/suggest.json?lang=' + vm.occurrenceState.query.locale
    },
    facets: {
      hasFacets: true,
      facetKey: 'COUNTRY'
    }
  };

  vm.filters.publishingCountry = {
    titleTranslation: 'filterNames.publishingCountry',
    queryKey: 'publishing_country',
    filter: OccurrenceFilter,
    enumTranslationPath: 'country.',
    search: {
      isSearchable: true,
      suggestEndpoint: '/api/country/suggest.json?lang=' + vm.occurrenceState.query.locale
    },
    facets: {
      hasFacets: false,
      facetKey: 'PUBLISHING_COUNTRY'
    }
  };

  vm.filters.eventId = {
    titleTranslation: 'filterNames.eventID',
    queryKey: 'event_id',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.eventId
    },
    facets: {
      hasFacets: false,
      facetKey: 'EVENT_ID'
    }
  };

  vm.filters.parentEventId = {
    titleTranslation: 'filterNames.parentEventID',
    queryKey: 'parent_event_id',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.parentEventId
    },
    facets: {
      hasFacets: false,
      facetKey: 'PARENT_EVENT_ID'
    }
  };

  vm.filters.samplingProtocol = {
    titleTranslation: 'filterNames.samplingProtocol',
    queryKey: 'sampling_protocol',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.samplingProtocol
    },
    facets: {
      hasFacets: false,
      facetKey: 'SAMPLING_PROTOCOL'
    }
  };

  vm.filters.networkKey = {
    titleTranslation: 'filterNames.networkKey',
    queryKey: 'network_key',
    filter: OccurrenceFilter,
    expand: {
      resource: Network,
      expandedTitle: 'title'
    },
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.networkKey,
      suggestTemplate: '/templates/components/filterTaxon/suggestBasicTemplate.html?v=' + BUILD_VERSION,
      suggestTitle: 'title',
      suggestShortName: 'title',
      suggestKey: 'key'
    },
    facets: {
      hasFacets: false,
      facetKey: 'NETWORK_KEY'
    }
  };

  // New es filters
  vm.filters.programme = {
    titleTranslation: 'filterNames.programme',
    queryKey: 'programme',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.programme
    }
  };
  vm.filters.project_id = {
    titleTranslation: 'filterNames.projectId',
    queryKey: 'project_id',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.projectId
    }
  };
  vm.filters.verbatim_scientific_name = {
    titleTranslation: 'filterNames.verbatimScientificName',
    queryKey: 'verbatim_scientific_name',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.verbatim_scientific_name
    }
  };
  vm.filters.taxon_id = {
    titleTranslation: 'filterNames.taxonId',
    queryKey: 'taxon_id',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.taxon_id
    }
  };
  vm.filters.organism_quantity = {
    titleTranslation: 'filterNames.organismQuantity',
    intervalTranslation: 'intervals.default.',
    queryKey: 'organism_quantity',
    filter: OccurrenceFilter,
    range: {
      'min': [0, 1],
      '10%': [1, 1],
      '50%': [10, 1],
      'max': [100000, 1]
    }
  };
  vm.filters.organism_quantity_type = {
    titleTranslation: 'filterNames.organismQuantityType',
    queryKey: 'organism_quantity_type',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.organism_quantity_type
    }
  };
  vm.filters.sample_size_unit = {
    titleTranslation: 'filterNames.sampleSizeUnit',
    queryKey: 'sample_size_unit',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.sample_size_unit
    }
  };
  vm.filters.sample_size_value = {
    titleTranslation: 'filterNames.sampleSizeValue',
    intervalTranslation: 'intervals.default.',
    queryKey: 'sample_size_value',
    filter: OccurrenceFilter,
    range: {
      'min': [0, 1],
      '50%': [1000, 1],
      'max': [1000000, 1]
    }
  };
  vm.filters.relative_organism_quantity = {
    titleTranslation: 'filterNames.relativeOrganismQuantity',
    intervalTranslation: 'intervals.default.',
    queryKey: 'relative_organism_quantity',
    filter: OccurrenceFilter,
    step: 0.0001,
    range: {
      'min': [0, 1],
      '10%': [0.00001, 1],
      '25%': [0.000025, 1],
      '50%': [0.0001, 1],
      '75%': [0.0002, 1],
      'max': [1, 1]
    }
  };

  vm.filters.collection_key = {
      titleTranslation: 'filterNames.collectionKey',
      queryKey: 'collection_key',
      filter: OccurrenceFilter,
      expand: {
          resource: Collection,
          expandedTitle: 'name'
      },
      search: {
          isSearchable: true,
          suggestEndpoint: suggestEndpoints.collectionKey,
          suggestTemplate: '/templates/components/filterTaxon/suggestGrSciCollTemplate.html?v=' + BUILD_VERSION,
          suggestTitle: function(item) {
            if (item.code) return item.name + ' (' + item.code + ')';
            return item.name;
          },
          suggestShortName: 'name',
          suggestKey: 'key'
      },
      facets: {
          hasFacets: false,
          facetKey: 'COLLECTION_KEY'
      }
  };

  vm.filters.institution_key = {
      titleTranslation: 'filterNames.institutionKey',
      queryKey: 'institution_key',
      filter: OccurrenceFilter,
      expand: {
          resource: Institution,
          expandedTitle: 'name'
      },
      search: {
          isSearchable: true,
          suggestEndpoint: suggestEndpoints.institutionKey,
          suggestTemplate: '/templates/components/filterTaxon/suggestGrSciCollTemplate.html?v=' + BUILD_VERSION,
          suggestTitle: function(item) {
            if (item.code) return item.name + ' (' + item.code + ')';
            return item.name;
          },
          suggestShortName: 'name',
          suggestKey: 'key'
      },
      facets: {
          hasFacets: false,
          facetKey: 'INSTITUTION_KEY'
      }
  };

  // End new es filters

  vm.filters.installationKey = {
    titleTranslation: 'filterNames.installationKey',
    queryKey: 'installation_key',
    filter: OccurrenceFilter,
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.installationKey
    },
    facets: {
      hasFacets: false,
      facetKey: 'INSTALLAION_KEY'
    }
  };

  vm.filters.basisOfRecord = {
    titleTranslation: 'filterNames.basisOfRecord',
    queryKey: 'basis_of_record',
    filter: OccurrenceFilter,
    enumTranslationPath: 'basisOfRecord.',
    showAll: true,
    enums: enums.basisOfRecord,
    reversible: true,
    facets: {
      hasFacets: true,
      facetKey: 'BASIS_OF_RECORD'
    }
  };

  vm.filters.protocol = {
    titleTranslation: 'filterNames.protocol',
    queryKey: 'protocol',
    filter: OccurrenceFilter,
    enumTranslationPath: 'endpointType.',
    showAll: true,
    enums: enums.endpointType,
    reversible: true,
    facets: {
      hasFacets: true,
      facetKey: 'PROTOCOL'
    }
  };

  vm.filters.month = {
    titleTranslation: 'filterNames.month',
    queryKey: 'month',
    filter: OccurrenceFilter,
    enumTranslationPath: 'month.',
    showAll: true,
    enums: enums.month,
    reversible: true,
    facets: {
      hasFacets: true,
      facetKey: 'MONTH'
    }
  };


  /*
   Special suggest with templates and name resolving as the url contains ID's
   it might be worth joining normal suggest and facets with these. Currently it just seemed like a configuration chaos that wouldn't help understanding.
   If these filters grow and it is starting to become a headache aligning them, then this decision should be reconsidered
   */
  vm.filters.dataset = {
    titleTranslation: 'filterNames.datasetKey',
    queryKey: 'dataset_key',
    filter: OccurrenceFilter,
    expand: {
      resource: Dataset,
      expandedTitle: 'title'
    },
    facets: {
      hasFacets: true,
      facetKey: 'DATASET_KEY'
    },
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.dataset,
      suggestTemplate: '/templates/components/filterTaxon/suggestBasicTemplate.html?v=' + BUILD_VERSION,
      suggestTitle: 'title',
      suggestShortName: 'title',
      suggestKey: 'key'
    }
  };

  vm.filters.lifeStage = {
    titleTranslation: 'filterNames.lifeStage',
    queryKey: 'life_stage',
    filter: OccurrenceFilter,
    expand: {
      resource: LifeStage,
      expandedTitle: 'name'
    },
    facets: {
      hasFacets: false,
      facetKey: 'LIFE_STAGE'
    },
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.lifeStage,
      suggestTemplate: '/templates/components/filterTaxon/suggetVocabularyTemplate.html?v=' + BUILD_VERSION,
      suggestTitle: function(item) {
        return $filter('vocabularyLabel')(item);
      },
      suggestShortName: 'name',
      suggestKey: 'name',
      defaultParams: {limit: 20}
    }
  };

  vm.filters.taxonKey = {
    titleTranslation: 'filterNames.taxonKey',
    queryKey: 'taxon_key',
    filter: OccurrenceFilter,
    expand: {
      resource: Species,
      expandedTitle: 'scientificName'
    },
    facets: {
      hasFacets: false,
      facetKey: 'TAXON_KEY'
    },
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.taxon,
      defaultParams: {
        datasetKey: 'd7dddbf4-2cf0-4f39-9b2a-bb099caae36c'
      },
      suggestTemplate: '/templates/components/filterTaxon/suggestTaxonTemplate.html?v=' + BUILD_VERSION,
      suggestTitle: 'scientificName',
      suggestShortName: 'title',
      suggestKey: 'key'
    }
  };

  vm.filters.hostingOrganizationKey = {
    titleTranslation: 'filterNames.hostingOrganizationKey',
    queryKey: 'hosting_organization_key',
    filter: OccurrenceFilter,
    expand: {
      resource: Publisher,
      expandedTitle: 'title'
    },
    facets: {
      hasFacets: false
    },
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.publisher,
      suggestTemplate: '/templates/components/filterTaxon/suggestBasicTemplate.html?v=' + BUILD_VERSION,
      suggestTitle: 'title',
      suggestShortName: 'title',
      suggestKey: 'key'
    }
  };

  vm.filters.publisher = {
    titleTranslation: 'filterNames.publishingOrg',
    queryKey: 'publishing_org',
    filter: OccurrenceFilter,
    expand: {
      resource: Publisher,
      expandedTitle: 'title'
    },
    facets: {
      hasFacets: true,
      facetKey: 'PUBLISHING_ORG'
    },
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.publisher,
      suggestTemplate: '/templates/components/filterTaxon/suggestBasicTemplate.html?v=' + BUILD_VERSION,
      suggestTitle: 'title',
      suggestShortName: 'title',
      suggestKey: 'key'
    }
  };

  vm.filters.gadmGid = {
    titleTranslation: 'filterNames.gadmGid',
    queryKey: 'gadm_gid',
    filter: OccurrenceFilter,
    expand: {
      resource: Gadm,
      expandedTitle: 'name'
    },
    facets: {
      hasFacets: false,
      facetKey: 'GADM_GID'
    },
    search: {
      isSearchable: true,
      suggestEndpoint: suggestEndpoints.gadm,
      suggestTemplate: '/templates/components/filterTaxon/suggestGadmTemplate.html?v=' + BUILD_VERSION,
      suggestTitle: function(item) {
        return item.name + ' - ' + item.id;
      },
      suggestShortName: 'name',
      suggestKey: 'id'
    }
  };

  // intervals
  vm.filters.year = {
    titleTranslation: 'filterNames.year',
    intervalTranslation: 'intervals.year.',
    queryKey: 'year',
    filter: OccurrenceFilter,
    range: {
      'min': [1000, 1],
      '10%': [1700, 1],
      '50%': [1960, 1],
      'max': [new Date().getFullYear()]
    }
  };

  vm.filters.elevation = {
    titleTranslation: 'filterNames.elevation',
    intervalTranslation: 'intervals.elevation.',
    queryKey: 'elevation',
    filter: OccurrenceFilter,
    range: {
      'min': [0, 1],
      '50%': [2500, 1],
      'max': [9999, 1]
    }
  };

  vm.filters.depth = {
    titleTranslation: 'filterNames.depth',
    intervalTranslation: 'intervals.depth.',
    queryKey: 'depth',
    filter: OccurrenceFilter,
    range: {
      'min': [0, 1],
      '50%': [2500, 1],
      'max': [9999, 1]
    }
  };

  vm.filters.coordinateUncertaintyInMeters = {
    titleTranslation: 'filterNames.coordinateUncertaintyInMeters',
    intervalTranslation: 'intervals.coordinateUncertaintyInMeters.',
    queryKey: 'coordinateUncertaintyInMeters',
    filter: OccurrenceFilter,
    range: {
      'min': [0, 1],
      '10%': [100, 10],
      '50%': [10000, 100],
      'max': [1000000]
    }
  };

  // ternary "all, yes, no" aka optional boolean
  vm.filters.repatriated = {
    titleTranslation: 'filterNames.repatriated',
    descriptionTranslation: 'filters.repatriation.description',
    queryKey: 'repatriated',
    filter: OccurrenceFilter
  };

  // ternary "all, yes, no" aka optional boolean
  vm.filters.occurrenceStatus = {
    titleTranslation: 'filterNames.occurrenceStatus',
    descriptionTranslation: 'filters.occurrenceStatus.description',
    queryKey: 'occurrence_status',
    filter: OccurrenceFilter,
    options: {
      yes: 'present',
      no: 'absent'
    },
    optionTranslation: 'filters.occurrenceStatus.options',
    warnWhenNotSet: true,
    showWarning: function (resolve, reject) {
      return OccurrenceSearch.query(_.assign({}, vm.occurrenceState.query, {limit: 0, occurrence_status: 'absent'}))
        .$promise
        .then(function(data) {
          resolve(data.count > 0);
        })
        .catch(reject);
    }
  };

  // ternary "all, yes, no" aka optional boolean
  vm.filters.isClustered = {
    titleTranslation: 'filterNames.isInCluster',
    descriptionTranslation: 'filters.isClustered.description',
    queryKey: 'is_in_cluster',
    filter: OccurrenceFilter
  };

  // dates
  vm.filters.lastInterpreted = {
    titleTranslation: 'filterNames.lastInterpreted',
    intervalTranslation: 'intervals.year.',
    queryKey: 'last_interpreted',
    filter: OccurrenceFilter
  };

  vm.filters.eventDate = {
    titleTranslation: 'filterNames.eventDate',
    intervalTranslation: 'intervals.year.',
    queryKey: 'event_date',
    filter: OccurrenceFilter
  };

  // location
  vm.filters.location = {
    filter: OccurrenceFilter,
    queryKey: 'geometry',
    expanded: false
  };


  vm.toggleAdvanced = function () {
    OccurrenceFilter.updateParam('advanced', vm.occurrenceState.query.advanced);
  };

  vm.search = function () {
    vm.occurrenceState.query.q = vm.freeTextQuery;
    $state.go('.', vm.occurrenceState.query, { inherit: false, notify: true, reload: true });
  };

  vm.updateSearch = function () {
    vm.occurrenceState.query.offset = undefined;
    vm.occurrenceState.query.limit = undefined;
    vm.occurrenceState.query.q = vm.freeTextQuery;
    $state.go($state.current, vm.occurrenceState.query, { inherit: false, notify: false, reload: false });
  };
  vm.searchOnEnter = function (event) {
    if (event.which === 13) {
      vm.updateSearch();
    }
  };

  vm.clearFreetextAndSetFocus = function () {
    document.getElementById('siteSearch').focus();
    vm.freeTextQuery = '';
  };
  // might be interesting to look at: http://chieffancypants.github.io/angular-hotkeys/
  hotkeys.add({
    combo: 'alt+f',
    description: 'Site search',
    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
    callback: function (event) {
      vm.clearFreetextAndSetFocus();
      event.preventDefault();
    }
  });

  hotkeys.add({
    combo: 'alt+enter',
    description: 'Apply',
    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
    callback: function (event) {
      vm.updateSearch();
      event.preventDefault();
    }
  });

  vm.freeTextSpeciesSuggestion = undefined;
  vm.showFreeTextSpeciesSuggestion = false;
  vm.testFreeTextForSpeciesName = function () {
    vm.freeTextSpeciesSuggestion = SpeciesMatch.query({
      verbose: false,
      name: vm.occurrenceState.query.q
    }, function (response) {
      if (response.matchType !== 'NONE' && response.confidence > 80) {
        vm.showFreeTextSpeciesSuggestion = true;
      }
    });
  };
  vm.testFreeTextForSpeciesName();
  vm.freeTextQuery = vm.occurrenceState.query.q;

  vm.addTaxon = function (taxon) {
    vm.occurrenceState.query.q = '';
    vm.occurrenceState.query.taxon_key = $filter('unique')(vm.occurrenceState.query.taxon_key);
    vm.occurrenceState.query.taxon_key = [taxon.usageKey].concat(vm.occurrenceState.query.taxon_key);
    vm.occurrenceState.query.taxon_key = $filter('unique')(vm.occurrenceState.query.taxon_key);
    vm.occurrenceState.query.offset = undefined;
    vm.occurrenceState.query.limit = undefined;
    $state.go($state.current, vm.occurrenceState.query, { inherit: false, notify: true, reload: true });
  };

  vm.getUrlSize = function () {
    return $window.location.href.length;
  };

  $scope.$watch(function () {
    return vm.occurrenceState.query.q;
  }, function () {
    vm.freeTextQuery = vm.occurrenceState.query.q;
  });
}

module.exports = occurrenceCtrl;
