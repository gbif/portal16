"use strict";
var _ = require('lodash');

function attachImages(occurrenceResults) {
    occurrenceResults.forEach(function (e) {
        var mediaLength = _.get(e, 'media.length', 0);
        e._images = [];
        for (var i = 0; i < mediaLength; i++) {
            if (e.media[i].type == 'StillImage') {
                e._images.push(e.media[i]);
                if (_.isUndefined(e._image)) {
                    e._image = e.media[i];
                }
            }
        }
    });
    return occurrenceResults;
}

var precalculatedKeys = ['taxonKey', 'datasetKey', 'country', 'publishingCountry', 'publishingOrg'];
function isSimpleQuery(f) {
    if (!f.hasCoordinate === 'true' && !f.hasGeospatialIssue === 'false') {
        return false;
    }
    f = _.omitBy(_.clone(f), function(e){
        return _.isUndefined(e);
    });
    delete f.locale;
    delete f.zoom;
    delete f.advanced;

    var counter = 2;
    counter += f.basisOfRecord ? 1 : 0;

    //is year a simple query
    if (_.isArray(f.year) && f.year.length > 1) {
        return false;
    }
    counter += f.year ? 1 : 0;

    for (var i = 0; i < precalculatedKeys.length; i++) {
        var type = precalculatedKeys[i];
        //is the standard keys single or an array
        if (_.isArray(f[type]) && f[type].length > 1) {
            return false;
        }
        //only one is allowed
        if (f[type]) {
            counter += 1;
            break;
        }
    }
    return (Object.keys(f).length - counter) == 0; //if there is more than the counted filters then it isn't a simple query
}

module.exports = {
    attachImages: attachImages,
    isSimpleQuery: isSimpleQuery
};