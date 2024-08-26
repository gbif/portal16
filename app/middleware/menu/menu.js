/**
 add menu to all requests.
 */
let menuBuilder = require('./menuBuilder');
let fallbackMenu = menuBuilder.fallbackMenu;
let getMenu = menuBuilder.getMenu;

let menus = {};

// get date stamp for cache
function getCacheDate() {
    return new Date().toISOString();
}

let lastCacheDate = null;

async function getMenuData(locale, __) {
    // if cached version ready, then use that
    let cachedMenu = menus[locale];
    
    // if there is a cached version and it is less than 5 minutes old, then use that
    if (cachedMenu && lastCacheDate && new Date() - new Date(lastCacheDate) < 2 * 60 * 1000) {
        return cachedMenu;
    }
    let menuPromise = getMenu(locale, __)
        .then(function(dynamicMenu) {
            menus[locale] = dynamicMenu;
            lastCacheDate = getCacheDate();
            return dynamicMenu;
        }).catch(function() {
            return fallbackMenu;
        });
    if (cachedMenu) {
        return cachedMenu;
    } else {
        return menuPromise;
    }
}

function use(app) {
    app.use(function(req, res, next) {
        getMenuData(res.locals.gb.locales.current, req.__)
            .then(function(menuDynamic) {
                res.locals.gb = res.locals.gb || {};
                res.locals.gb.menu = menuDynamic;
                next();
            }).catch(function() {
                res.locals.gb = res.locals.gb || {};
                res.locals.gb.menu = fallbackMenu;
                next();
            });
    });
}

module.exports = {
    use: use
};

