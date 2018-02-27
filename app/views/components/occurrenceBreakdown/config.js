var config = {
    dimensions: ['basisOfRecord', 'country', 'speciesKey', 'decimalLatitude', 'issue', 'datasetKey', 'month'],
    chartTypes: ['BAR', 'COLUMN', 'PIE', 'TABLE'],
    printableTypes: ['BAR', 'COLUMN', 'PIE'],
    supportedTypes: {
        basisOfRecord: ['BAR', 'COLUMN', 'PIE', 'TABLE'],
        month: ['COLUMN', 'PIE'],
        country: ['TABLE'],
        speciesKey: ['TABLE'],
        decimalLatitude: ['BAR'],
        issue: ['BAR', 'COLUMN', 'PIE', 'TABLE'],
        datasetKey: ['BAR', 'TABLE']
    }
};

if (Object.freeze) {
    Object.freeze(config);
}
module.exports = config;
