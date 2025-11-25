'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('Species', function($resource, env) {
            return $resource(env.dataApi + 'species/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesSynonyms', function($resource, env) {
            return $resource(env.dataApi + 'species/:id/synonyms', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesCombinations', function($resource, env) {
            return $resource(env.dataApi + 'species/:id/combinations', null, {
                    'query': {
                        method: 'GET',
                        isArray: true
                    }
                }
            );
        })
        .factory('SpeciesVerbatim', function($resource, env) {
            return $resource(env.dataApi + 'species/:id/verbatim', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesDistributions', function($resource, env) {
            return $resource(env.dataApi + 'species/:id/distributions', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesChildren', function($resource, env) {
            return $resource(env.dataApi + 'species/:id/children', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesParents', function($resource, env) {
            return $resource(env.dataApi + 'species/:id/parents', null, {
                    'query': {
                        method: 'GET',
                        isArray: true
                    }
                }
            );
        })
        .factory('SpeciesRelated', function($resource, env) {
            return $resource(env.dataApi + 'species/:id/related', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesDescriptions', function($resource, env) {
            return $resource(env.dataApi + 'species/:id/descriptions', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesReferences', function($resource, env) {
            return $resource(env.dataApi + 'species/:id/references', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesMedia', function($resource, env) {
            return $resource(env.dataApi + 'species/:id/media', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesOccurrenceMedia', function($resource, env) {
            return $resource(env.dataApi + 'occurrence/experimental/multimedia/species/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesTreatment', function($resource, env) {
            return $resource('/api/species/:id/treatment', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesTreatments', function($resource, env) {
            return $resource('/api/species/:id/treatments', null, {
                    'query': {
                        method: 'GET',
                        isArray: true
                    }
                }
            );
        })
        .factory('SpeciesVernacularName', function($resource) {
            return $resource('/api/species/:id/vernacularName', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesVernacularNames', function($resource) {
            return $resource('/api/species/:id/vernacularNames', null, {
                    'get': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesParsedName', function($resource) {
            return $resource('/api/species/:id/name', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesBulkParsedNames', function($resource) {
            return $resource('/api/species/names', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesOccurrenceDatasets', function($resource, env) {
            return $resource('/api/species/:id/occurencedatasets', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('SpeciesChecklistDatasets', function($resource, env) {
            return $resource('/api/species/:id/checklistdatasets', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('SpeciesSearch', function($resource) {
            return $resource('/api/species/search', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        })
        .factory('SpeciesMatch', function($resource, env) {
            return $resource(env.dataApi + 'species/match', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesRoot', function($resource, env) {
            return $resource(env.dataApi + 'species/root/:key', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('SpeciesSuggest', function($resource, env) {
            return $resource(env.dataApi + 'species/suggest', null, {
                    'query': {
                        method: 'GET',
                        isArray: true
                    }
                }
            );
        })
        .factory('SpeciesConstituentSearch', function($resource) {
            return $resource('/api/species/constituents', null, {
                    'query': {
                        method: 'GET',
                        isArray: false,
                        cancellable: true
                    }
                }
            );
        });
})();

