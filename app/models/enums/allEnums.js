module.exports = {
    "month": require('./basic/month.json'),
    "typeStatus": require('./basic/typeStatus.json'),
    "basisOfRecord": require('./basic/basisOfRecord.json'),
    "establishmentMeans": require('./basic/establishmentMeans.json'),
    "mediaType": require('./basic/mediaType.json'),
    "rank": require('./basic/rank.json'),
    "occurrenceIssue": require('./basic/occurrenceIssue.json'),
    "license":  require('./basic/license.json'),
    "datasetType":  require('./basic/datasetType.json'),
    "cms": {
        "type": require('./cms/contentType.json'),
        "language": require('./cms/language.json'),
        "category_about_gbif": require('./cms/category_about_gbif.json'),
        "category_audience": require('./cms/category_audience.json'),
        "category_data_type": require('./cms/category_data_type.json')
    }
};
