'use strict';
var helper = require('../util/util'),
    Q = require('q'),
    expandFacets = require('./expandFacets');

function cmsEndpointAccess(path) {
    var deferred = Q.defer();
    helper.getApiData(path, function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(new Error(err));
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(new Error(err));
        }
    });
    return deferred.promise;
}

module.exports = {
    expandFacets: expandFacets,
    cmsEndpointAccess: cmsEndpointAccess
};