let express = require('express'),
    auth = require('../../auth/auth.service'),
    router = express.Router({caseSensitive: true}),
    controller = require('./derivedDataset.controller');

module.exports = function(app) {
    app.use('/', router);
};

router.get('/derived-dataset', renderTemplate);
router.get('/derived-dataset/about', renderTemplate);
router.get('/derived-dataset/register', renderTemplate);
router.post('/api/derived-dataset', auth.isAuthenticated(), create);
router.put('/api/derived-dataset/:doi', auth.isAuthenticated(), update);

function renderTemplate(req, res, next) {
    res.render('pages/tools/derivedDataset/derivedDataset', {
        _meta: {
            title: req.__('tools.derivedDataset.title'),
            noIndex: true
        }
    });
}

async function create(req, res, next) {
   try {
       let response = await controller.createDerivedDatasetAsJson(req.body, req.user);
        return res.send(response);
   } catch (error) {
    res.status(error.statusCode || 500);
    res.send();
   }
}

async function update(req, res, next) {
    try {
        let response = await controller.updateDerivedDatasetAsJson(req.body, req.user);
         return res.send(response);
    } catch (error) {
     res.status(error.statusCode || 500);
     res.send();
    }
 }


