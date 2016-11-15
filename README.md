# Portal 2016
A new GBIF.org, scheduled to be completed in 2016

> Note: Under development

## Install, build and run

### Requirements

* Node version 6.2 installed.
* Working gyp command line tools. On Mac that means that either xcode or the Command Line Tools needs to installed: `xcode-select --install`

### Install
Once the project is downloaded install using
`npm install`
this will install dependencies from npm and bower and run a production build

### Build for production
The static assets (client css, fonts and js) is build with Gulp. NODe_ENV sets the endpoints. --prod sets the build type
```
NODE_ENV=prod gulp --prod
//OR
NODE_ENV=prod node node_modules/gulp/bin/gulp.js --prod
```

### Run
Now start the server
```
npm start
//OR
NODE_ENV=prod node app.js
```
this will start the server in production mode.

## Run local development version
```
npm run local
```
Logs end up in `user/.forever/` if nothing else is specified




## Development
During development it can be useful that the server restarts if files are changed and the browser refresh. To run in development mode
```
NODE_ENV=local gulp --loglevel=terminal
```
This will build static assets and start the server.
Most files are watched though not all and when new files are created gulp will not detect changes in these.

### Test
> This is under development. Both framework and approach to testing browserified code is missing. Guidelines and examples are to be created

Start in development mode and continuously run server and client tests
```
gulp --test
```

### e2e tests using protractor
installation see: http://www.protractortest.org/
install protractor `npm install -g protractor`
update webdriver `webdriver-manager update`
start webdriver `webdriver-manager start`
start the server at port 3000
run the tests `protractor e2e.conf.js`

### Debugging
Initiating debugging is very slow. Unclear what the best approach is. Currently I start gulp in dev mode with `gulp --tdd` and then in another process starts node inspector with `node-debug app.js --port=3002`

Alternatively one can start node in debug mode listening to port 5858 after the prod anvironment was build. This works nicely to debug in IntelliJ:
```
NODE_ENV=prod node --debug=5858 app.js --port=3000
```

## Logging
Logging via [https://github.com/trentm/node-bunyan](https://github.com/trentm/node-bunyan)

run either gulp or node with --loglevel=[terminal,debug,info,warn,error].
```
# debug to console
gulp --loglevel=terminal

# log only info, warnings and errors.
node app.js --loglevel=info
```

### Read log files
Pretty print log files

```
node_modules/bunyan/bin/bunyan log/warn.log.0
```

Filter file

```
node_modules/bunyan/bin/bunyan log/warn.log.0 -c 'this.randomAtt == "is is a warning"'
```

More options at [http://trentm.com/node-bunyan/bunyan.1.html](http://trentm.com/node-bunyan/bunyan.1.html)


## Technologies

* Templating is done using [Nunjucks](https://mozilla.github.io/nunjucks/)
* The server is [Express](http://expressjs.com/)
* The CSS is build using the [Stylus](http://stylus-lang.com/) precompiler and [PostCSS](https://github.com/postcss/postcss) plugins

### Image caching, cropping and resizing
We use [Thumbor](http://thumbor.org), see [image caching](./image_caching.md) for more details.


## Project overview
See [project structure](project_structure.md)
Some folders have a readme describing the content of that folder.


## Issues
Which labels to use for issues

**page group**
All groups include tabs. More can come if there arise a need for other sensible groups
dataset, occurrence, species, publisher, country, cms, homepage, search, tools, download, user mangement

**impact**
luxury, useful, blocker
TODO: might be worth quantifying terms such as "rarely", "few" etc.

* luxury: used by few people that could get that information by other means. Or used rarely and not essential to usage.
* useful: the site can be used just fine without it, but it would improve the experience significantly. users are expected to notice on a daily basis
* blocker: Essential to site usage. The experience would improve for the majority of our users. Or something that is a nuisance to users on a daily basis

**cost**
hours, days, 3days+

* hours: expected to be completed in less than a day. could be 10 minutes, could be 7 hours.
* days: less than 3 days
* 3days+: more than 3 days

**type**
bug, enhancement, usability, editorial, duplicate, invalid, won't fix, infrastructure, api
these should be self explanatory, but a few words on some of them

* editorial: is a content issue in the cms or translations. Content issues related to the published data doesn't belong in this project.
* infrastructure: e.g. build process, logging, firewalls etc.
* api: requires work on the api to complete the task
* usability: not a bug per se, but an improvement related to the interface and typically not in new functionality

## Attribution
This project is possible due to the many people that share their work under CC.
Attributing everyone in the interface where e.g. icons and libraries are used, isn't feasible. 

### Libraries

### Images

### Icons
Butterfly by Marcela Almeida  from the Noun Project - https://thenounproject.com/search/?q=butterfly&i=39183
drop by José Campos from the Noun Project - https://thenounproject.com/search/?q=drop&i=55403
Funnel by David from the Noun Project - https://thenounproject.com/search/?q=funnel&i=430438
Microscope by Alex Auda Samora from the Noun Project - https://thenounproject.com/search/?q=microscope&i=94605
Quote by Yoshi from the Noun Project - https://thenounproject.com/search/?q=citation&i=450890

### data
ISO country codes - http://data.okfn.org/data/core/country-codes

