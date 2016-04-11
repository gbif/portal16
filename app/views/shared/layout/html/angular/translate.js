var angular = require('angular');
require('angular-translate');
angular
    .module('portal')
    .config(translaterConfig);


var translations = require('./translations/translations');

// Should load translations async or at least from separate file so that it is simpler to provide translations. look into http://angular-translate.github.io/docs/#/guide/12_asynchronous-loading
// as service http://angular-translate.github.io/docs/#/guide/03_using-translate-service
// Using with params in strings http://angular-translate.github.io/docs/#/guide/06_variable-replacement
/** @ngInject */
function translaterConfig($translateProvider) {
    $translateProvider
        .translations('en', translations.en)
        .translations('da', translations.da);

    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escape'); // http://angular-translate.github.io/docs/#/guide/19_security
}

module.exports = translaterConfig;