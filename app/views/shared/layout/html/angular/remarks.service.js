'use strict';

let angular = require('angular');

(function() {
    'use strict';

    angular
        .module('portal')
        .service('Remarks', function($http, env) {
            let remarks = $http.get(env.dataApi + 'enumeration/interpretationRemark');
            return remarks;
        });
})();


