'use strict';

/**
 * @fileOverview Route to the GBIF Network page, an index to all participants.
 */

const express = require('express'),
      router = express.Router(),
      helper = require('../../models/util/util'),
    Q = require('q'),
    TheGbifNetwork = rootRequire('app/models/gbifdata/theGbifNetwork/theGbifNetwork'),
      resourceKey = require("../resource/key/resourceKey");


module.exports = function (app) {
    app.use('/', router);
};

router.get('/the-gbif-network/:region?', (req, res, next) => {

    let context = {},
        query = {},
        validRegions = ['GLOBAL', 'AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'NORTH_AMERICA', 'OCEANIA'],
        participantTypes = ['voting_participant', 'associate_country_participant', 'other_associate_participant'],
        region;

    if (typeof req.params.region !== 'undefined' && req.params.region !== 'participant-organisations') {

        region = req.params.region.toUpperCase().replace('-', '_')

        } else {

        region = 'GLOBAL';

        };

    if (validRegions.indexOf(region) !== -1) {
        query.gbifRegion = region;
    }
    else {
       next();
       return;
    }

    context.validRegions = validRegions;
    context.participantTypes = participantTypes;
    context.locale = req.locale;

    res.render('pages/theGbifNetwork/theGbifNetwork.nunjucks', {});


    // TheGbifNetwork.get(res).then((data)=>{
    //     context.intro = data[0];
    //
    // }).then(()=>{
    //     res.render('pages/theGbifNetwork/theGbifNetwork.nunjucks', {
    //         data: context,
    //         hasTitle: true
    //     });
    //
    //     })
    //
    // .catch(err => {
    //     next(err + 'at theGbifNetwork.ctrl line 55.')
    // });


    // let promises = [resourceKey.getByAlias(req.path, 2, false, res.locals.gb.locales.current), TheGbifNetwork.get(res)];
    //
    // Q.all(promises).then((values)=>{
    //
    //     res.render('pages/theGbifNetwork/theGbifNetwork.nunjucks', {
    //         main: values[0].main,
    //         intro: values[1][0],
    //         hasTitle: true
    //     });
    // })


     // TheGbifNetwork.get(res)
     //    // .then(data => {
     //    //     context.intro = data[0];
     //    //     let url = 'http://' + req.get('host') + '/api/directory/participants/count';
     //    //     return helper.getApiDataPromise(url, {'qs': query});
     //    // })
     //    // .then(count => {
     //    //     context.count = count;
     //    //     let url = 'http://' + req.get('host') + '/api/publisher/count';
     //    //     return helper.getApiDataPromise(url, {'qs': query});
     //    // })
     //    // .then(count => {
     //    //    context.count = Object.assign(context.count, count);
     //    //    let url = 'http://' + req.get('host') + '/api/literature/count';
     //    //    return helper.getApiDataPromise(url, {'qs': query});
     //    // })
     //    .then(count => {
     //        // context.count = Object.assign(context.count, count);
     //        res.render('pages/theGbifNetwork/theGbifNetwork.nunjucks', {
     //            // data: context,
     //            hasTitle: true
     //        });
     //    })
     //    .catch(err => {
     //        next(err + 'at theGbifNetwork.ctrl line 22.')
     //    });
});
