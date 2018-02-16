/**
 * create a human readable title to display on the occurrence detail page a la "Puma Concolor observed in Italy"
 */
let _ = require('lodash');

module.exports = function(occurrence, __) {
    let name = occurrence.record.scientificName || __('occurrence.title.unknownSpecies');

    let location = __('occurrence.title.unknownLocation');
    if (occurrence.record.countryCode) {
        location = __('occurrence.title.inCountry', __('country.' + occurrence.record.countryCode));
    }

    let bor = _.get(occurrence, 'record.basisOfRecord', 'UNKNOWN');
    let verb = __('occurrence.title.verb.' + bor);

    return {
        name: name,
        verb: verb,
        location: location
    };
};
