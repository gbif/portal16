'use strict';

//TODO error handling and tests missing

var Q = require('q'),
    async = require('async'),
    helper = require('../../models/util/util');

var Resource = function (resourceIdentifier) {
    this.resourceIdentifier = resourceIdentifier;
};

Resource.getResource = function (resourceIdentifier, DataType) {
    var deferred = Q.defer();
    helper.getApiData(resourceIdentifier, function (err, data) {
        if (typeof data.errorType !== 'undefined') {
            var error = new Error(data.errorType);
            error.type = data.errorType;
            deferred.reject(error);
        } else if (data) {
            deferred.resolve(new DataType(data));
        }
        else {
            deferred.reject(new Error(err));
        }
    });
    return deferred.promise;
};

Resource.extendWith = function (dataInstance, resources) {
    /*
     dataInstance: object to be extended with the resources
     resources in type [{
     resource: 'http://api.gbif.org/v1/organization/' + this.record.publishingOrgKey,
     extendToField: 'publisher'
     }]
     */
    var deferred = Q.defer();
    Resource.getResources(resources, function (err, results) {
        if (err) {
            deferred.reject(new Error(err));
        }
        resources.forEach(function (e) {
            dataInstance[e.extendToField] = results[e.extendToField];
        });
        deferred.resolve(dataInstance);
    });
    return deferred.promise;
};

Resource.getResources = function (resources, callback) {
    var tasks = {};
    resources.forEach(function (e) {
        tasks[e.extendToField] = function (cb) {
            helper.getApiData(e.resource, cb, e.options);
        };
    });
    async.parallel(tasks, callback);
};

//wrappers for easily readable syntax
Resource.extend = function (obj) {
    return {
        with: function (resources) {
            return Resource.extendWith(obj, resources);
        }
    }
};

Resource.get = function (resourceIdentifier) {
    return new Resource(resourceIdentifier);
};

Resource.prototype.as = function (DataType) {
    if (typeof this.resourceIdentifier === 'undefined') {
        throw new Error('You need to define a resource first');
    } else {
        this.DataType = DataType;
        return Resource.getResource(this.resourceIdentifier, this.DataType);
    }
};

module.exports = Resource;