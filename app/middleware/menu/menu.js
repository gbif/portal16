/**
 add menu to all requests.
 */
let menuBuilder = require('./menuBuilder');
let fallbackMenu = menuBuilder.fallbackMenu;
let getMenu = menuBuilder.getMenu;

let menus = {};
async function getMenuData(locale, __) {
    // if cached version ready, then use that
    let cachedMenu = menus[locale];
    let menuPromise = getMenu(locale, __)
        .then(function(dynamicMenu) {
            menus[locale] = dynamicMenu;
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

