'use strict';

module.exports = {
    cleanFilter: cleanFilter
};

function cleanFilter(filter) {
    if (filter.species_key || filter.kingdom_key) {
        filter.taxon_key = filter.species_key || filter.kingdom_key;
        delete filter.species_key;
        delete filter.kingdom_key;
    }
    return filter;
}
