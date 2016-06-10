/**
 * create a human readable title to display on the occurrence detail page a la "Puma Concolor observed in Italy"
 */
var _ = require('lodash');

module.exports = function(occurrence, __){
    var name = occurrence.record.scientificName || __('occurrence.title.unknownSpecies');

    var location =  __('occurrence.title.unknownLocation');
    if (occurrence.record.countryCode) {
        location = __('occurrence.title.inCountry', __('country.' + occurrence.record.countryCode));
    }

    var bor = _.get(occurrence, 'record.basisOfRecord', 'UNKNOWN');
    var verb = __('occurrence.title.verb.' + bor);

    return {
        name: name,
        verb: verb,
        location: location
    };
};