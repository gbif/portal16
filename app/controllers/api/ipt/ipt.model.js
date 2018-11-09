'use strict';
let _ = require('lodash'),
    request = rootRequire('app/helpers/request'),
    apiConfig = rootRequire('app/models/gbifdata/apiConfig');

module.exports = {
    stats: stats
};

async function stats() {
    let options = {
        url: apiConfig.installation.url + '?limit=10000',
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }

    // process results

    // remove everything that isn't an ipt installation
    let installations = _.filter(response.body.results, ['type', 'IPT_INSTALLATION']);

    // decorate installations with their publishers
    await Promise.all(installations.map(function(e) {
return decorateWithPublisher(e);
}));

    let countryCount = _.uniqBy(installations, 'country').length;
    let installationCount = installations.length;
    let georeferencedInstallations = _.filter(installations, 'latitude');
    let publisherGroups = _.groupBy(georeferencedInstallations, 'organizationKey');
    let iptRelatedPublishers = Object.keys(publisherGroups).map(function(e) {
        let publisher = publisherGroups[e][0];
        publisher.iptInstallations = publisherGroups[e].length;
        return publisher;
    });

    let geojson = {
        'type': 'FeatureCollection',
        'features': iptRelatedPublishers.map(function(e) {
return getFeature(e);
})
    };

    return {
        countryCount: countryCount,
        installationCount: installationCount,
        geojson: geojson
    };
}

async function decorateWithPublisher(installation) {
    if (!installation.organizationKey) {
        return;
    }
    let options = {
        url: apiConfig.publisher.url + installation.organizationKey,
        method: 'GET',
        fullResponse: true,
        json: true
    };
    let response = await request(options);
    if (response.statusCode !== 200) {
        throw response;
    }

    installation.country = response.body.country;
    installation.latitude = response.body.latitude;
    installation.longitude = response.body.longitude;
    installation.numPublishedDatasets = response.body.numPublishedDatasets;
    installation.organizationTitle = response.body.title;
}

function getFeature(installation) {
    return {
            'type': 'Feature',
            'properties': {
            'key': installation.organizationKey,
            'title': installation.organizationTitle,
            'count': installation.iptInstallations
        },
            'geometry': {
            'type': 'Point',
            'coordinates': [
                installation.longitude,
                installation.latitude
            ]
        }
    };
}
