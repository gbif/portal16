"use strict";
var Q = require('q'),
    _ = require('lodash'),
    helper = rootRequire('app/models/util/util'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig');


function search(url) {
    "use strict";
    var deferred = Q.defer();
    helper.getApiData(url, function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            deferred.reject(data);
        } else if (data) {
            deferred.resolve(data);
        }
        else {
            deferred.reject(err);
        }
    }, {retries: 2, timeoutMilliSeconds: 30000});
    return deferred.promise;
}

function getBreakdown(params) {
    var results = {
        kingdoms: [
            {
                kingdom: {
                    key: 1,
                    scientificName: 'Animalia'
                },
                basisOfRecord: {
                    HUMAN_OBSERVATION: {
                        count: 123123,
                        HAS_COORDINATE: 9876
                    },
                    MACHINE_OBSERVATION: {
                        total: 1234,
                        HAS_COORDINATE: 987
                    }
                },
                total: {
                    count: 123412341234,
                    HAS_COORDINATE: 98769876
                }
            }
        ],
        total: {
            HUMAN_OBSERVATION: {
                total: 123123,
                HAS_COORDINATE: 9876
            },
            MACHINE_OBSERVATION: {
                total: 1234,
                HAS_COORDINATE: 987
            },
            ALL: {
                total: 123412341234,
                HAS_COORDINATE: 98769876
            }
        }
    };
}

module.exports = getBreakdown;