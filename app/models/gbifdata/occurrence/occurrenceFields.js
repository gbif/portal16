var record = [
    {
        gbif: 'basisOfRecord',
        verbatim: 'http://rs.tdwg.org/dwc/terms/basisOfRecord'
    },
    {
        gbif: 'collectionCode',
        verbatim: 'http://rs.tdwg.org/dwc/terms/collectionCode'
    },
    {
        gbif: 'identifier',
        verbatim: 'http://purl.org/dc/terms/identifier'
    },
    {
        gbif: 'institutionCode',
        verbatim: 'http://rs.tdwg.org/dwc/terms/institutionCode'
    },
    {
        gbif: 'modified',
        verbatim: 'http://rs.tdwg.org/dwc/terms/modified'
    }
];

var occurrence = [
    {
        gbif: 'catalogNumber',
        verbatim: 'http://rs.tdwg.org/dwc/terms/catalogNumber'
    },
    {
        gbif: 'individualCount',
        verbatim: 'http://rs.tdwg.org/dwc/terms/individualCount'
    },
    {
        gbif: 'occurrenceID',
        verbatim: 'http://rs.tdwg.org/dwc/terms/occurrenceID'
    },
    {
        gbif: 'recordedBy',
        verbatim: 'http://rs.tdwg.org/dwc/terms/recordedBy'
    }
];

var event = [
    {
        gbif: 'day',
        verbatim: 'http://rs.tdwg.org/dwc/terms/day'
    },
    {
        gbif: 'month',
        verbatim: 'http://rs.tdwg.org/dwc/terms/month'
    },
    {
        gbif: 'year',
        verbatim: 'http://rs.tdwg.org/dwc/terms/year'
    },
    {
        gbif: 'habitat',
        verbatim: 'http://rs.tdwg.org/dwc/terms/habitat'
    }
];

var location = [
    {
        gbif: 'coordinateUncertaintyInMeters',
        verbatim: 'http://rs.tdwg.org/dwc/terms/coordinateUncertaintyInMeters'
    },
    {
        gbif: 'country',
        verbatim: 'http://rs.tdwg.org/dwc/terms/country'
    },
    {
        gbif: 'county',
        verbatim: 'http://rs.tdwg.org/dwc/terms/county'
    }
];

var occurrenceFields = [
    {
        name: 'record',
        fields: record
    },
    {
        name: 'occurrence',
        fields: occurrence
    },
    {
        name: 'event',
        fields: event
    },
    {
        name: 'location',
        fields: location
    }
];

module.exports = occurrenceFields;