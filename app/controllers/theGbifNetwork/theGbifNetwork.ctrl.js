'use strict';

/**
 * @fileOverview Route to the GBIF Network page, an index to all participants.
 */

const express = require('express'),
      router = express.Router(),
        TheGbifNetwork = rootRequire('app/models/gbifdata/theGbifNetwork/theGbifNetwork'),
    Q = require('q'),
    helper = rootRequire('app/models/util/util'),
    resource = require('../resource/key/resourceKey');


module.exports = function (app) {
    app.use('/', router);
};

router.get('/the-gbif-network/:region?', (req, res, next) => {

    let query = {},
        validRegions = ['GLOBAL', 'AFRICA', 'ASIA', 'EUROPE', 'LATIN_AMERICA', 'NORTH_AMERICA', 'OCEANIA', 'PARTICIPANT_ORGANISATIONS'],

        region;

    if (typeof req.params.region !== 'undefined') {

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



    var contentPromise = ( region !== 'GLOBAL') ?  resource.getByAlias(req.path, 2, false) : Q.resolve(false) ;
    var introPromise = TheGbifNetwork.get(res);

    Q.all([introPromise, contentPromise])
        .then((result)=>{

            let opts = {intro: result[0][0]};
            if(result[1] !== false && result[1].main){
                opts.main = result[1].main
            }
             res.render('pages/theGbifNetwork/theGbifNetwork.nunjucks', opts);
        })
    .catch(err => {
        next(err )
    });





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

router.get('/templates/the-gbif-network/intro', (req, res, next) => {

    TheGbifNetwork.get(res)
       .then(data => {
           var intro = data[0];
           res.render('pages/theGbifNetwork/intro.nunjucks', {
                       intro: intro,
                       hasTitle: true
                   });
           })
});

router.get('/templates/the-gbif-network/:region/regionArticle.html', function (req, res, next) {

    let urlAlias = '/the-gbif-network/'+req.params.region;

    resource.getByAlias(urlAlias, 2, false, res.locals.gb.locales.current)
        .then(contentItem => {

            helper.renderPage(req, res, next, contentItem, 'pages/theGbifNetwork/regionArticle.nunjucks');
            //  res.json(result);
        })
        .catch(err =>{
            console.trace(err);
            res.status(500);
            res.send(err.message);
        })

});

