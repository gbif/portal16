let request = require('requestretry');
let _ = require('lodash');
let fs = require('fs');
let size = 50;

async function getUserRequests() {
    let urls = [];
    for (let i = 0; i < 8000; i += size) {
        // let url = `http://private-logs.gbif.org/elasticsearch/prod-web-*/_search?q=req.url:%22/api/species/%22&size=${size}&from=${i}`;
        // let url = `http://private-logs.gbif.org/elasticsearch/prod-web-*/_search?q=req.url:%22/api/species/%22&size=${size}&from=${i}`;
        let url = `http://private-logs.gbif.org/elasticsearch/prod-web-*/_search?q=message:"request%20start"&size=${size}&from=${i}`;
        // let url = `https://private-logs.gbif.org/elasticsearch/prod-web-*/_search?q=req.url:(%22/api/taxonomy/%22%20OR%20%22/api/species/%22)&size=${size}&from=${i}`;
        let response = await request.get(url, {json: true});
        if (response.statusCode === 200) {
            let hits = _.get(response.body, 'hits.hits', []);
            urls = urls.concat(hits.map(function(e) {
                return e._source.req.url;
            }));
        }
    }
    urls = _.uniq(urls);
    _.remove(urls, function(e) {
        return e.startsWith('/api/feedback');
    });
    _.remove(urls, function(e) {
        return e.startsWith('/api/cites');
    });
    _.remove(urls, function(e) {
        return e.startsWith('/api/occurrence/search');
    });
    _.remove(urls, function(e) {
        return e.startsWith('/api/occurrence/breakdown');
    });

    fs.writeFile('./scripts/replay/urls.json', JSON.stringify(urls, null, 2), function(err) {
        if (err) {
            return console.log(err);
        }
        console.log('The file was saved!');
    });
}

// getUserRequests();

async function replayUrls() {
    let urls = require('./urls');
    for (let i = 0; i < urls.length; i++) {
        let url = `http://www.gbif-staging.org${urls[i]}`;
        let response = await request.get(url, {method: 'HEAD'});
        if (response.statusCode > 404) {
            console.log('statusCode: ' + response.statusCode);
            console.log(url);
        }
    }
}
replayUrls();
