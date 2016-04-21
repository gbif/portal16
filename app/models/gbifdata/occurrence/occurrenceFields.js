var record = [
    {
        gbif: 'key',
        verbatim: 'key'
    },
    {
        gbif: 'basisOfRecord',
        verbatim: 'http://rs.tdwg.org/dwc/terms/basisOfRecord'
    },
    {
        gbif: 'publishingOrgKey',
        verbatim: 'publishingOrgKey'
    },
    {
        gbif: 'kingdom',
        verbatim: 'kingdom'
    },
    {
        gbif: 'protocol',
        verbatim: 'protocol'
    },
    {
        gbif: 'lastCrawled',
        verbatim: 'lastCrawled'
    }
];

var occurrence = [
    {
        gbif: 'key',
        verbatim: 'key'
    },
    {
        gbif: 'datasetKey',
        verbatim: 'datasetKey'
    },
    {
        gbif: 'publishingOrgKey',
        verbatim: 'publishingOrgKey'
    },
    {
        gbif: 'publishingCountry',
        verbatim: 'publishingCountry'
    },
    {
        gbif: 'protocol',
        verbatim: 'protocol'
    },
    {
        gbif: 'lastCrawled',
        verbatim: 'lastCrawled'
    }
];

var event = [
    {
        gbif: 'key',
        verbatim: 'key'
    },
    {
        gbif: 'datasetKey',
        verbatim: 'datasetKey'
    },
    {
        gbif: 'lastCrawled',
        verbatim: 'lastCrawled'
    }
];

var location = [
    {
        gbif: 'key',
        verbatim: 'key'
    },
    {
        gbif: 'datasetKey',
        verbatim: 'datasetKey'
    },
    {
        gbif: 'lastCrawled',
        verbatim: 'lastCrawled'
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