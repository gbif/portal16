let express = require('express'),
    router = express.Router({caseSensitive: true}),
    userModel = require('../../user/user.model'),
    _ = require('lodash'),
    log = require('../../../../../config/log');

module.exports = function(app) {
    app.use('/api', router);
};

router.get('/occurrence-snapshots', async function(req, res) {
    try {
        const snapshots = await getSnapshots(req);
        res.status(200).json(snapshots);
    } catch (err) {
        if (err.statusCode < 500) {
            res.status(err.statusCode || 422);
        } else {
            log.error(err);
            res.sendStatus(500);
        }
    }
});

async function getSnapshots(request) {
    let limit = _.get(request, 'query.limit', 100);
    let offset = _.get(request, 'query.offset', 0); 
    let snapshots = await userModel.getDownloads('download.gbif.org', {limit, offset});
    return snapshots;
    }
