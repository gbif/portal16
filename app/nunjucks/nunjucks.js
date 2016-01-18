var nunjucks = require('nunjucks');

module.exports = function(app, config) {
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'nunjucks');
    var nunjucksConfiguration = nunjucks.configure(config.root + '/app/views', {
        autoescape: true,
        express: app,
        noCache: app.locals.ENV_DEVELOPMENT
    });

    require('./filters')(nunjucksConfiguration, config);
    
};