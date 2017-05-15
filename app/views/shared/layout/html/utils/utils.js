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

module.exports = {
    attachImages: attachImages
};