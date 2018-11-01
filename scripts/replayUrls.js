let request = require('requestretry');
let _ = require('lodash');
let size = 50;

async function getUserRequests() {
    let urls = [];
    for (let i = 0; i < 2000; i += size) {
        let url = `http://private-logs.gbif.org/elasticsearch/prod-web-*/_search?q=req.url:%22/api/species/%22&size=${size}&from=${i}`
        let response = await request.get(url, {json: true});
        if (response.statusCode === 200) {
            let hits = _.get(response.body, 'hits.hits', []);
            urls = urls.concat(hits.map(function(e) {
                return e._source.req.url;
            }));
        }
    }
    urls = _.uniq(urls);
    console.log(urls);
}

getUserRequests();
