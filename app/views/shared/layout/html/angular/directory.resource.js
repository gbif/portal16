'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('DirectoryContacts', function ($resource) {
            return $resource('/api/directory/contacts', null, {
                'get': {
                    method: 'GET',
                    isArray: false
                }
            });
        });

})();

