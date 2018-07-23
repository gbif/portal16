# Portal 2016
A new GBIF.org, scheduled to be completed in 2016

> Note: Under development

## Install, build and run

### Requirements

* Node version v7.10.0 installed.
* Working gyp command line tools. On Mac that means that either xcode or the Command Line Tools needs to installed: `xcode-select --install`

### Install
Once the project is downloaded install using
`npm install`
this will install dependencies from npm and run a production build

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

## Credentials
The portal expects a json file with credentials to github repositories etc. You can point to a test github repository for testing.
The file is expected to be located at `/etc/portal16/credentials.json` alternatively the location can be defined with `gulp --credentials=your/path//and/filename`
The format is:
```
{
  "directory": {
    "appKey": "user",
    "secret": "password"
  },
  "portalFeedback": {
    "repository": "your/githubTestRepository",
    "user": "user",
    "password": "password"
  },
  "suggestDataset": {
  	"repository": "your/githubTestRepository",
    "user": "user",
    "password": "password"
  }
}
```



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

### Translations
backend done using https://github.com/mashpie/i18n-node
frontend using https://github.com/angular-translate/angular-translate
currently the same file is shared. That only works partly since the two formats are not identical
We should probably have to files, one for backend, one for frontend and then copy values that are identical (so that translators won't have to edit two places)
It would be sensible to extend angular translate with angular-translate-interpolation-messageformat to allow easier pluralization and gender.

## Project overview
See [project structure](project_structure.md)
Some folders have a readme describing the content of that folder.


## Issues
Which labels to use for issues

**impact**
TODO: might be worth quantifying terms such as "rarely", "few" etc.

* low impact: used by few people that could get that information by other means. Or used rarely and not essential to usage.
* medium impact: the site can be used just fine without it, but it would improve the experience significantly. users are expected to notice on a daily basis
* high impact: The experience would improve for the majority of our users. Or something that is a nuisance to users on a daily basis.
* release blocker: Essential to site usage. Should be fixed before release

**cost**
hours, days, 3days+, week+

* hours: expected to be completed in less than a day. could be 10 minutes, could be 7 hours.
* days: less than 3 days
* 3days+: more than 3 days
weeks: more than a weeks work

**type**
bug, improvement, usability, editorial, duplicate, invalid, won't fix, infrastructure, api, cms
these should be self explanatory, but a few words on some of them

* editorial: is a content issue in the cms or translations. Content issues related to the published data doesn't belong in this project.
* infrastructure: e.g. build process, logging, firewalls etc.
* api: requires work on the api to complete the task
* cms: requires work on cms api or cms content model and interface
* usability: not a bug per se, but an improvement related to the interface and typically not in new functionality
* improvement: new functionality

**page group**
All groups include tabs. More can come if there arise a need for other sensible groups
dataset, occurrence, species, publisher, country, articles, homepage, search, tools, download, user mangement

### Big Thanks

This project is possible due to the many people that share their work under CC.
Attributing everyone in the interface where e.g. icons and libraries are used, isn't feasible. 

### Testing
Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs](https://saucelabs.com)

### Libraries

### Images

### Icons
Butterfly by Marcela Almeida  from the Noun Project - https://thenounproject.com/search/?q=butterfly&i=39183
drop by José Campos from the Noun Project - https://thenounproject.com/search/?q=drop&i=55403
Funnel by David from the Noun Project - https://thenounproject.com/search/?q=funnel&i=430438
Microscope by Alex Auda Samora from the Noun Project - https://thenounproject.com/search/?q=microscope&i=94605
Quote by Yoshi from the Noun Project - https://thenounproject.com/search/?q=citation&i=450890
Unicorn by Pieter J. Smits from the Noun Project - https://thenounproject.com/term/unicorn/78104/
Bug by Edward Boatman from the Noun Project - https://thenounproject.com/search/?q=bug&i=198
Idea by Edward Boatman from the Noun Project - https://thenounproject.com/search/?q=idea&i=762
User by Viktor Vorobyev from the Noun Project - https://thenounproject.com/search/?q=user&i=415727
Filter by Landan Lloyd from the Noun Project - https://thenounproject.com/search/?q=filter&i=1181313
Data Architecture by MRFA from the Noun Project - https://thenounproject.com/search/?q=family%20tree&i=440017
Click by Viktor Vorobyev from the Noun Project - https://thenounproject.com/search/?q=mouse%20arrow&i=859256
youtube by Roman Shvets from the Noun Project - https://thenounproject.com/search/?q=youtube&i=897674
Table by Arthur Shlain from the Noun Project - https://thenounproject.com/search/?q=excel&i=138432
Upload by Chinnaking from the Noun Project - https://thenounproject.com/search/?q=upload&i=1195513
Server by Aybige from the Noun Project - https://thenounproject.com/search/?q=server&i=1283372
heartbeat by Nick Abrams from the Noun Project - https://thenounproject.com/term/heartbeat/40432/
Vimeo by <div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
Graph by Lakshisha from the Noun Project https://thenounproject.com/search/?q=bar%20chart&i=1231321#_=_
Pie Chart by Royyan Razka from the Noun Project https://thenounproject.com/search/?q=pie%20chart&i=1137970#_=_
Pie chart by Andrejs Kirma from the Noun Project https://thenounproject.com/search/?q=data%20visualisation&i=1334866#_=_
Graph by Kirsh from the Noun Project https://thenounproject.com/search/?q=graph&i=1255772#_=_

### data
ISO country codes - http://data.okfn.org/data/core/country-codes 

