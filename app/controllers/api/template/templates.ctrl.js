let express = require('express'),
    env = require('../../../../config/config'),
    helper = rootRequire('app/models/util/util'),
    router = express.Router(),
    minute = 60, // cache goes by seconds
    hour = minute * 60,
    day = hour * 24;

module.exports = function(app) {
    app.use('/api/template', router);
};

router.get('/*.html', function(req, res, next) {
    res.header('Cache-Control', 'public, max-age=' + day * 100);
    next();
});

router.get('/footer.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'shared/layout/partials/footer/footer');
});

router.get('/terms.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'shared/layout/partials/popups/terms/terms');
});

router.get('/gdpr.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'shared/layout/partials/popups/gdpr/gdpr.html');
});

router.get('/search/eventResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/event/eventSearchResult');
});

router.get('/search/faqResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/help/faqSearchResult');
});

router.get('/search/documentResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/document/documentSearchResult');
});

router.get('/search/dataUseResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/dataUse/dataUseSearchResult');
});

router.get('/search/newsResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/news/newsSearchResult');
});

router.get('/search/projectResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/project/projectSearchResult');
});

router.get('/search/programmeResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/programme/programmeSearchResult');
});

router.get('/search/literatureResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/literature/literatureSearchResult');
});

router.get('/search/toolResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/tool/toolSearchResult');
});

router.get('/search/articleResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/resource/key/article/articleSearchResult');
});

router.get('/search/datasetResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/dataset/datasetSearchResult');
});

router.get('/collection/key.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/grscicoll/collection/key/collectionKey.template.nunjucks');
});

router.get('/institution/key.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/grscicoll/institution/key/institutionKey.template.nunjucks');
});

router.get('/grscicollPerson/key.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/grscicoll/person/key/personKey.template.nunjucks');
});

router.get('/search/speciesResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/species/speciesSearchResult');
});

router.get('/search/publisherResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/publisher/publisherSearchResult');
});

router.get('/publisher/key.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/publisher/key/publisherKey.template.nunjucks');
});

router.get('/publisher/datasets.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/publisher/key/datasets/publisherDatasets.template.nunjucks');
});

router.get('/publisher/installations.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/publisher/key/installations/publisherInstallations.template.nunjucks');
});

router.get('/publisher/metrics.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/publisher/key/metrics/publisherMetrics.template.nunjucks');
});

router.get('/search/countryResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/participant/countrySearchResult');
});

router.get('/search/participantResult.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/participant/participantSearchResult');
});

router.get('/network.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/network/key/networkKey.template.nunjucks');
});

router.get('/country.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/participant/country/country.template.nunjucks');
});

router.get('/country/summary.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/participant/country/summary/summary.template.nunjucks');
});

router.get('/country/about.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/participant/country/about/about.template.nunjucks');
});

router.get('/country/publishing.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/participant/country/publishing/publishing.template.nunjucks');
});

router.get('/country/participation.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/participant/country/participation/participation.template.nunjucks');
});

router.get('/country/publications.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/participant/country/research/research.template.nunjucks');
});


router.get('/species/key.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/species/key/speciesKey.template.nunjucks');
});

router.get('/dataset/key.html', function(req, res, next) {
    helper.renderPage(req, res, next, {
        kibanaIndex: env.kibanaIndex,
        publicKibana: env.publicKibana}, 'pages/dataset/key/datasetKey.template.nunjucks');
});

router.get('/dataset/taxonomy.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/dataset/key/taxonomy/datasetTaxonomy.template.nunjucks');
});

router.get('/dataset/project.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/dataset/key/project/datasetProject.template.nunjucks');
});

router.get('/dataset/stats.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/dataset/key/stats/datasetStats.template.nunjucks');
});

router.get('/dataset/activity.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/dataset/key/activity/datasetActivity.template.nunjucks');
});

router.get('/dataset/constituents.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/dataset/key/constituents/datasetConstituents.template.nunjucks');
});

router.get('/dataset/event.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/dataset/key/event/event.template.nunjucks');
});

router.get('/dataset/parentevent.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/dataset/key/parentEvent/parentEvent.template.nunjucks');
});

router.get('/site/footer.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'shared/layout/partials/footer/footer.nunjucks');
});

router.get('/thegbifnetwork/participantDetails.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/theGbifNetwork/participantDetails.html');
});

router.get('/thegbifnetwork/participantTable.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/theGbifNetwork/participantsDigest/participantTable.html');
});

router.get('/thegbifnetwork/regionalReps.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/theGbifNetwork/participantsDigest/regionalReps.html');
});

router.get('/developer/:page/tpl.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/developer/' + req.params.page + '.nunjucks');
});

router.get('/node/key.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/node/key/nodeKey.template.nunjucks');
});

router.get('/participant/key.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/participant/participant/participant.template.nunjucks');
});


router.get('/contactUs/directory.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/custom/contactUs/directory/contactDirectory.template.nunjucks');
});

router.get('/faq.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/custom/faq/faq.template.nunjucks');
});

router.get('/tools/dataValidator.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/tools/dataValidator/dataValidator.template.nunjucks');
});

router.get('/tools/dataValidatorKey.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/tools/dataValidator/dataValidatorKey.template.nunjucks');
});

router.get('/tools/dataValidator/results/issues.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/tools/dataValidator/results/issues.html');
});

router.get('/tools/dataValidator/results/termsFrequency.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/tools/dataValidator/results/termsFrequency.html');
});

router.get('/tools/dataValidator/validationResults.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/tools/dataValidator/validationResults.html');
});

router.get('/tools/dataValidator/document.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/tools/dataValidator/document/prose.nunjucks');
});

router.get('/tools/dataValidator/about.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/tools/dataValidator/about/dataValidatorAbout.template.nunjucks');
});

router.get('/tools/dataValidator/extensions.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/tools/dataValidator/extensions/extensions.nunjucks');
});

router.get('/tools/dataRepository.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/tools/dataRepository/dataRepository.template.nunjucks');
});

router.get('/tools/dataRepository/upload.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/tools/dataRepository/upload/dataRepositoryUpload.template.nunjucks');
});

router.get('/tools/dataRepository/about.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/tools/dataRepository/about/dataRepositoryAbout.template.nunjucks');
});

router.get('/tools/dataRepository/key.html', function(req, res, next) {
    helper.renderPage(req, res, next, {}, 'pages/tools/dataRepository/upload/key/dataRepositoryKey.template.nunjucks');
});
