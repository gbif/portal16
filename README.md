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

### Templating
is done using [Nunjucks](https://mozilla.github.io/nunjucks/)

### Server
The server is [Express](http://expressjs.com/)

### CSS
The CSS is build using the [Stylus](http://stylus-lang.com/) precompiler and [PostCSS](https://github.com/postcss/postcss) plugins

### Image caching, cropping and resizing
We use [Thumbor](http://thumbor.org), see [image caching](./image_caching.md) for more details.


## Project overview
See [project structure](project_structure.md)
Some folders have a readme describing the content of that folder.
