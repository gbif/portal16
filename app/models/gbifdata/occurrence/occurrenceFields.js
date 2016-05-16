var record = [
    {
        gbif: 'basisOfRecord',
        verbatim: 'http://rs.tdwg.org/dwc/terms/basisOfRecord',
        category: 'record'
    },
    {
        gbif: 'collectionCode',
        verbatim: 'http://rs.tdwg.org/dwc/terms/collectionCode',
        category: 'record'
    },
    {
        gbif: 'identifier',
        verbatim: 'http://purl.org/dc/terms/identifier',
        category: 'record'
    },
    {
        gbif: 'institutionCode',
        verbatim: 'http://rs.tdwg.org/dwc/terms/institutionCode',
        category: 'record'
    },
    {
        gbif: 'modified',
        verbatim: 'http://rs.tdwg.org/dwc/terms/modified',
        category: 'record'
    }
];

var occurrence = [
    {
        gbif: 'catalogNumber',
        verbatim: 'http://rs.tdwg.org/dwc/terms/catalogNumber',
        category: 'occurrence'
    },
    {
        gbif: 'individualCount',
        verbatim: 'http://rs.tdwg.org/dwc/terms/individualCount',
        category: 'occurrence'
    },
    {
        gbif: 'occurrenceID',
        verbatim: 'http://rs.tdwg.org/dwc/terms/occurrenceID',
        category: 'occurrence'
    },
    {
        gbif: 'recordedBy',
        verbatim: 'http://rs.tdwg.org/dwc/terms/recordedBy',
        category: 'occurrence'
    }
];

var event = [
    {
        gbif: 'day',
        verbatim: 'http://rs.tdwg.org/dwc/terms/day',
        category: 'event'
    },
    {
        gbif: 'month',
        verbatim: 'http://rs.tdwg.org/dwc/terms/month',
        category: 'event'
    },
    {
        gbif: 'year',
        verbatim: 'http://rs.tdwg.org/dwc/terms/year',
        category: 'event'
    },
    {
        gbif: 'habitat',
        verbatim: 'http://rs.tdwg.org/dwc/terms/habitat',
        category: 'event'
    }
];

var location = [
    {
        gbif: 'coordinateUncertaintyInMeters',
        verbatim: 'http://rs.tdwg.org/dwc/terms/coordinateUncertaintyInMeters',
        category: 'location'
    },
    {
        gbif: 'country',
        verbatim: 'http://rs.tdwg.org/dwc/terms/country',
        category: 'location'
    },
    {
        gbif: 'county',
        verbatim: 'http://rs.tdwg.org/dwc/terms/county',
        category: 'location'
    }
];

var categories = ['record', 'occurrence', 'event', 'location'];
var terms = record.concat(occurrence).concat(event).concat(location);
var occurrenceFields = {
    terms: terms,
    categories: categories
};

module.exports = occurrenceFields;