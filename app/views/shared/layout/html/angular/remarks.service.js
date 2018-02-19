'use strict';

var angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .service('Remarks', function($http, env) {
            var remarks = $http.get(env.dataApi + 'enumeration/interpretationRemark');
            return remarks;
        });
})();


