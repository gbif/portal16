# Portal 2016
A new GBIF.org, scheduled to be completed in 2016

> Note: Under development



##Install, build and run

###Requirements
Node installed in version 5.3
Working gyp command line tools. On mac that means that either xcode or the Command Line Tools needs to installed
`xcode-select --install`

###Install
Once the project is downloaded install using
`npm install`
this will install dependencies from npm and bower and run a production build

###Build for production
The static assets (client css, fonts and js) is build with Gulp
```
gulp --prod
//OR
node node_modules/gulp/bin/gulp --prod
```

###Run
Now start the server
```
npm start
```
this will start the server in production mode.

##Run with forever
In production we might want to run with [Forever](https://github.com/foreverjs/forever) in case an error slips through
```
node node_modules/forever/bin/forever start app.js
node node_modules/forever/bin/forever stop app.js
```
Logs end up in `user/.forever/` if nothing else is specified 




##Development
During development it can be useful that the server restarts if files are changed and the browser refresh. To run in development mode
```
gulp
```
This will build static assets and start the server.
Most files are watched though not all and when new files are created gulp will not detect changes in these.

###Test
> This is under development. Both framework and approach to testing browserified code is missing. Guidelines and examples are to be created

Start in development mode and continuously run server and client tests
```
gulp --test
```

### Debugging
Initiating debugging is very slow. Unclear what the best approach is. Currently I start gulp in dev mode with `gulp --tdd` and then in another process starts node inspector with `node-debug app.js --port=3002`


## Logging
Logging via [https://github.com/trentm/node-bunyan](https://github.com/trentm/node-bunyan)

run either gulp or node with --loglevel=[terminal,debug,info,warn,error].
```
# debug to console
gulp --loglevel=terminal

# log only info, warnings and errors.
node app.js --loglevel=info
```

###  Read log files
Pretty print log files

 ```
node_modules/bunyan/bin/bunyan log/warn.log.0
```
 
Filter file
 
 ```
node_modules/bunyan/bin/bunyan log/warn.log.0 -c 'this.randomAtt == "is is a warning"'
```


More options at [http://trentm.com/node-bunyan/bunyan.1.html](http://trentm.com/node-bunyan/bunyan.1.html)


##Technologies

###Templating
is done using [Nunjucks](https://mozilla.github.io/nunjucks/)

###Server 
The server is [Express](http://expressjs.com/)

###CSS
The CSS is build using the [Stylus](http://stylus-lang.com/) precompiler and [PostCSS](https://github.com/postcss/postcss) plugins






##Project overview
See (project_structure.md)[project_structure.md]
Some folder also have a readme describing the content of that folder


