let nunjucks = require('nunjucks');
let markdown = require('nunjucks-markdown');
let marked = require('marked');


module.exports = function(app, config) {
    app.set('view engine', 'nunjucks');// to avoid having to specify file ext

    let nunjucksConfiguration = nunjucks.configure(config.root + '/app/views', {
        autoescape: true,
        express: app,
        noCache: app.locals.ENV_DEVELOPMENT,
        tags: {
            variableStart: '{$',
            variableEnd: '$}'
        }
    });
    nunjucksConfiguration.addGlobal('BUILD_VERSION', new Date().getTime());

    markdown.register(nunjucksConfiguration, marked);
    require('./filters')(nunjucksConfiguration, config);
};

