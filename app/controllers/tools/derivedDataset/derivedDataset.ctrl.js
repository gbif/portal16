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
       let response = await controller.createDerivedDataset(req.body, req.user, req.headers);
        return res.send(response);
   } catch (error) {
    const code = error.statusCode || 500;
    const message = error.body || 'Unknown error';
    res.status(code);
    res.send({message, code});
   }
}

async function update(req, res, next) {
    try {
        let response = await controller.updateDerivedDataset(req.body, req.user);
         return res.send(response);
    } catch (error) {
     const code = error.statusCode || 500;
     const message = error.body || 'Unknown error';
     res.status(code);
     res.send({message, code});
    }
 }


