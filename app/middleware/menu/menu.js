/**
 add menu to all requests
 */
var menu = rootRequire('/app/models/menu');

function use(app) {
    app.use(function (req, res, next) {
        res.locals.gb = res.locals.gb || {};
        res.locals.gb.menu = menu;
        next();
    });
}

module.exports = {
    use: use
};

