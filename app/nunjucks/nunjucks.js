var nunjucks = require('nunjucks'),
    markdown = require('nunjucks-markdown'),
    fs = require('fs'),
    marked = require('marked');

module.exports = function (app, config) {
    app.set('view engine', 'nunjucks');//to avoid having to specify file ext

    var templateDir = config.root + '/build/nunjucks';
    try {
        fs.accessSync(templateDir, fs.F_OK);
        // build/nunjucks folder exists - use it
    } catch (e) {
        // not existing, use unmodified source files directly
        console.log("Rev'ed nunjucks templates not existing at " + templateDir);
        templateDir = config.root + '/app/views';
    }
    console.log("Use nunjucks templates from " + templateDir);
    var nunjucksConfiguration = nunjucks.configure(templateDir, {
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
