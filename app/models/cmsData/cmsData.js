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

// @todo group CMS API assessment functions as a test project with Drupal.
function verifyCmsFacets(facets) {
    return facets.every(facet => {
        if (facet.hasOwnProperty('field') && facet.hasOwnProperty('counts') && facet.counts.length >= 0) {
            return facet.counts.every(count => {
                return count.hasOwnProperty('enum') && count.hasOwnProperty('count');
            });
        }
        else {
            return false;
        }
    });
}

module.exports = {
    expandFacets: expandFacets,
    cmsEndpointAccess: cmsEndpointAccess,
    verifyCmsFacets: verifyCmsFacets
};
