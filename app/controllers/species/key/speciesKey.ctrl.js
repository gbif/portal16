var express = require('express'),
    Taxon = require('../../../models/gbifdata/gbifdata').Taxon,
    Q = require('q'),
    _ = require('lodash'),
    nsMap = rootRequire('app/helpers/namespaces'),
    router = express.Router();

module.exports = function (app) {
    app.use('/', router);
};

router.get('/species/:key(\\d+)\.:ext?', taxonRoute);
router.get('/taxon/:key(\\d+)\.:ext?', taxonRoute);

router.get('/species/:key(\\d+)/verbatim', verbatimRoute);
router.get('/taxon/:key(\\d+)/verbatim', verbatimRoute);

router.get('/species/:key(\\d+)/taxonomy', taxonomyRoute);
router.get('/taxon/:key(\\d+)/taxonomy', taxonomyRoute);

function taxonRoute(req, res, next) {
    render(req, res, next, 'speciesKey', ['name', 'dataset', 'constituent', 'homonyms', 'typification', 'occurrenceGeoRefCount', 'occurrenceCount', 'vernacular', 'info']);
}

function verbatimRoute(req, res, next) {
    render(req, res, next, 'speciesVerbatim', ['name', 'dataset', 'constituent', 'verbatim']);
}

function taxonomyRoute(req, res, next) {
    render(req, res, next, 'speciesTaxonomy', ['name', 'dataset', 'constituent']);
}


function render(req, res, next, page, lookups) {
    getTaxon(req.params.key, res.locals.gb.locales.current, lookups).then(function (taxon) {
        try {
            if (!taxon.isNub()) {
                new Error("No backbone taxon: " + taxon.key);
            }
            res.render('pages/species/key/'+page, {
                key: taxon.record.key,
                taxon: taxon,
                _meta: {
                    title: taxon.record.scientificName
                }
            });
        } catch (e) {
            next(e);
        }
    });
}

function getTaxon(key, lang, lookups) {
    var deferred = Q.defer();
    var getOptions = {
        //TODO: replace occ counts with solr facets
        expand: lookups
    };

    Taxon.get(key, getOptions).then(function (taxon) {
        // this should be done server side in the future: http://dev.gbif.org/issues/browse/POR-307
        if (taxon.vernacular) {
            uniqPageResult(taxon.vernacular, function(v){
                return v.vernacularName + "|" + (v.language || '');
            }, function(v){
                return v.language;
            });
            // pick one vernacular name of requested language
            taxon.vernacular.results.some(function (v) {
                //TODO: create lookup map for 3 letter iso codes to 2 letter ones as used by the locale
                // use http://api.gbif-dev.org/v1/enumeration/language
                if (v.language == lang || v.language == 'eng') {
                    taxon.record.vernacularName = v.vernacularName;
                    taxon.record.vernacularLang = v.language;
                }
                return v.language == lang || v.language == 'eng';
            });
        }
        // merge infos into single object
        mergeInfos(taxon);
        // remove self from homonyms
        if (taxon.homonyms) {
            _.remove(taxon.homonyms.results, function(tax) {
                return tax.key == key;
            });
        }
        if (taxon.verbatim) {
            taxon.verbatim = cleanupVerbatim(taxon.verbatim);
        }
        deferred.resolve(taxon);

    }, function (err) {
        console.log(err);
        deferred.reject(new Error(err));

    }).fail(function (err) {
        console.log(err);
        deferred.reject(new Error(err));
    }).done();

    return deferred.promise;
}

// aggregates all species infos into 1 object
//TODO: do in backbone & server see http://dev.gbif.org/issues/browse/POR-358
function mergeInfos (taxon) {
    var info = {};
    if (taxon.info) {
        _.each(taxon.info.results, function (i) {
            _.merge(info, i);
        });
    }
    taxon.info = info;
}

function uniqPageResult(page, hashFunc, sortFunc) {
    page.results = _.sortedUniqBy(_.sortBy(page.results, sortFunc), hashFunc);
}

function cleanupVerbatim(v) {
    var v2 = {};
    _.forOwn(v, function(val, key) {
        if (_.startsWith(key, 'http')) {
            v2[normTerm(key)]=val;
        }
    });
    v2.extensions={};
    _.forOwn(v.extensions, function(records, eterm){
        var records2 = [];
        _.forEach(records, function(rec){
            var rec2 = {};
            _.forOwn(rec, function(value, term){
                rec2[normTerm(term)]=value;
            });
            records2.push(rec2);
        });
        v2.extensions[normTerm(eterm)] = records2;
    });
    return v2;

    function normTerm(term) {
        var index = term.lastIndexOf('/');
        var ns    = term.slice(0, index);
        var name  = term.substr(index+1);

        if (ns in nsMap) {
            ns = nsMap[ns]+":";
        } else {
            ns=ns+"/";
        }
        return ns + name;
    }
}

