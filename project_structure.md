# Project structure

* **app** : server and client application code, html and css
* **bower_componenets** : frontend dependencies
* **config**
* **coverage** : code coverage reports from tests
* **gulp** : build and test tasks
* **loadtests** : config and reports
* **locales** : server translation files for different languages
* **log** : rotating server log files
* **node_modules** : back and front end dependencies
* **public** : created by gulp build
* **reports** : reports from code style and tests
* **spec** : test configuration
**.bowerrc** : bower meta config
**.editorconfig** : cross IDE config
**.eslintrc** : javascript linting config
**.gitignore**
**app.js** : initializes the app
**bower.json** : front end dependencies config
**gulpfile.js** : entry for build and test tasks
**karma.conf.js** : frontend test configuration
**package.json** : general dependencies configuration and project description

Description of the individual folders - if any - can be found in the folder itself.

## app

* **assets** : fonts, images, favicons
* **controllers** : defines app routes and their logic
* **errors** : error handlers
* **helpers** : shared code and functionality
* **middleware** : Express middlewares which process the incoming requests before handling them down to the controllers
* **models** : represents data, implements business logic and handles storage
* **nunjucks** : template configuration and customization
* **views** : templates that are rendered and served by our routes. Also holds client side js and style. 


