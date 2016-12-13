var nunjucks = require('nunjucks'),
    markdown = require('nunjucks-markdown'),
    buildCfg = rootRequire('config/build'),
    marked = require('marked');

module.exports = function (app, config) {
    app.set('view engine', 'nunjucks');//to avoid having to specify file ext

    var revision = buildCfg.loadRevision();
    var nunjucksConfiguration = nunjucks.configure(config.root + '/public/templates/' + revision, {
        autoescape: true,
        express: app,
        noCache: app.locals.ENV_DEVELOPMENT,
        tags: {
            variableStart: '{$',
            variableEnd: '$}'
        }
    });

    markdown.register(nunjucksConfiguration, marked);

    require('./filters')(nunjucksConfiguration, config);

};
