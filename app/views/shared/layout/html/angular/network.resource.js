'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .factory('Network', function($resource, env) {
            return $resource(env.dataApi + 'network/:id', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('NetworkDatasets', function($resource, env) {
            return $resource(env.dataApi + 'network/:id/constituents', null, {
                    'query': {
                        method: 'GET',
                        isArray: false
                    }
                }
            );
        })
        .factory('NetworkPublishers', function($resource, env) {
          return $resource(env.dataApi + 'network/:id/organization', null, {
                  'query': {
                      method: 'GET',
                      isArray: false
                  }
              }
          );
      })
    ;
})();

