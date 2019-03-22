let _ = require('lodash');
let log = require('../../../config/log');
let esFallbackNavigation = require('./esFallbackNavigation.json');
let esFallBackHomePage = require('./esFallBackHomePage.json');
let resourceSearch = rootRequire('app/controllers/api/resource/search/resourceSearch');
let fallbackMenu;

function transformEsNavigationElements(mainNavigationElements, navElements) {
    let navIdMap = _.keyBy(navElements.results, 'id');
    let menuBuild = [];
    mainNavigationElements.forEach(function(e) {
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
        navEl.childNavigationElements.forEach(function(e, i) {
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

