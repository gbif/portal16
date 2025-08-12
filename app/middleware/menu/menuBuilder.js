let _ = require('lodash');
let log = require('../../../config/log');
let esFallbackNavigation = require('./esFallbackNavigation.json');
let esFallBackHomePage = require('./esFallBackHomePage.json');
let resourceSearch = rootRequire('app/controllers/api/resource/search/resourceSearch');
let fallbackMenu;

const tools = [
    {"id":"3dzaGtpNq9JbAZmlr6PK4W","title":"Publishing"},
{"id":"3kBP0icrgjbDEmaNat7U5T","title":"Data validator"},
{"id":"FLvrz0ikcG6ptz0zmG9ig","title":"Data access and use"},
{"id":"5lKYpEiKWcEZw236onWC0S","title":"Derived datasets"},
{"id":"4Sz7SkqEIGjGpHUZ8npNmq","title":"Tools catalogue"},
{"id":"2MqCiB6EmXD5NcEae5MkqB","title":"GBIF labs"},
{"id":"60d24DXxTrkL2sjhqx7eWs","title":"Species matching"},
{"id":"5JRnxf6iuakryCwnDNIzcK","title":"Name parser"},
{"id":"4SuZULciqn7L21nMxTLhIg","title":"Sequence ID"},
{"id":"1EgLC1X1aAvDENM7TYL0wY","title":"Relative observation trends"},
];

const toolsMap = _.keyBy(tools, 'id');


function transformEsNavigationElements(mainNavigationElements, navElements) {
    let navIdMap = _.keyBy(navElements.results, 'id');
    let menuBuild = [];

    mainNavigationElements.filter((e) => e.id === "6NBwCayI3rNgZdzgqeMnCX").forEach(function(e) {
        if (!e.id) {
            throw new Error('Invalid navigation element');
        }
       // console.log('Building menu for element: ' + JSON.stringify(e));
        menuBuild.push(buildElement(e.id, navIdMap));
    });
    return menuBuild;
}

function buildElement(key, navIdMap) {
    let navEl = navIdMap[key];
    let item = {
        name: navEl.title,
        externalLink: !!navEl.externalLink,
        roles: navEl.roles
    };
    if (navEl.link) {
        item.url = navEl.link;
    } else if (navEl.childNavigationElements) {
        item.items = [];
        item.type = 'normal';
        navEl.childNavigationElements.filter(e => !!toolsMap[e.id]).forEach(function(e, i) {
            if (e.id === key) {
                throw new Error('Circular menu: ' + key);
            }
            if (!e.id) {
                throw new Error('Missing child id: ' + key);
            }
            let sub = buildElement(e.id, navIdMap);
            if (sub.items) {
                if (item.type !== 'mega' && i > 0) {
                    throw new Error('Mega menus need all children to have items');
                }
                item.type = 'mega';
            }
            item.items.push(sub);
        });
    } else {
        throw new Error('A menu items should either have children or a link : ' + key);
    }
    return item;
}

try {
    fallbackMenu = transformEsNavigationElements(esFallBackHomePage.results[0].mainNavigationElements, esFallbackNavigation);
} catch (err) {
    log.error(err);
}

function getMenuOrFallback(home, nav) {
    try {
        return transformEsNavigationElements(home, nav);
    } catch (err) {
        log.error(err);
        return fallbackMenu;
    }
}

async function getMenu(locale, __) {
    let nav = await resourceSearch.search({contentType: 'navigationElement', limit: 200, locale: locale}, __, {requestTimeout: 2000});
    let home = await resourceSearch.search({contentType: 'homePage', limit: 200, locale: locale}, __, {requestTimeout: 2000});
    return getMenuOrFallback(_.get(home, 'results[0].mainNavigationElements', []), nav);
}

module.exports = {
    getMenu: getMenu,
    fallbackMenu: fallbackMenu
};

