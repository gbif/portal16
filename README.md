# Portal 2016
A new GBIF portal, scheduled to be completed in 2016

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
In production we might wan't to run with [Forever](https://github.com/foreverjs/forever) in case an error slips through
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


###Icon font
> The icon font still needs some attention. It is not obvious that it scales well to smaller fonts.

The icon font is build separately and the corresponding css generated. This is a separate build done when new icons is needed in the font.
To append an icon to the font add the svg to `app/assets/icons/used`.
`app/assets/icons/all` is a set of icons that might be useful and provides a style guide for custom icons. 
The list of icons can also be seen here [http://themes-pixeden.com/font-demos/7-stroke/](http://themes-pixeden.com/font-demos/7-stroke/).
Build using 
```
gulp fonts
```
This will create the fonts and place them at `app/assets/iconfont/`
and also create a stylus file and copy it to `app/views/shared/style/fonts`. When located there it will be injected into the main css file along with the other stylus files once the project is build.


###Favicons, manifest etc
Generated with [http://realfavicongenerator.net/](http://realfavicongenerator.net/)
We could do it as a gulp task `gulp-real-favicon` that would then include the newest and fanciest icons as new platforms come out. 
But for know hardcoding them seems fine. 





##Technologies

###Templating
is done using [Nunjucks](https://mozilla.github.io/nunjucks/)

###Server 
The server is [Express](http://expressjs.com/)

###CSS
The CSS is build using the [Stylus](http://stylus-lang.com/) precompiler and [PostCSS](https://github.com/postcss/postcss) plugins


##Project overview

###Gulp
`/gulpfile.js` is the main entry point when running Gulp. The individual tasks are placed under `/gulp/tasks`. Configuration of paths etc is found in `config/build.js`.

###Log
> Needs work. Seems unstable

Logs are placed in `/log`.

Logs are written in rotation. The log files is monitored by a separate process and send to the central GBIF Kibana log.
Bunyan is what we currently use, but it seems unstable, but curious if it is the constant restarting during development.
An alternative is Winston.
Still need some middleware (such as bunyan-request ) to log express requests.

###Public
Static files are build to the `/public` folder. This folder is deleted in the beginning of the build.

###Config
Basic configuration of server, build etc.

* `build.js`: defines paths to use during build, test and development.
* `config`: Configuration object to use on the server. Ports, log, name
* `express`: Creating the server, setting template engine, and registering routes etc.
* `log.js`: configure logging




