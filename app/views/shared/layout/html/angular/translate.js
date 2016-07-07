var angular = require('angular');
require('angular-translate');
require('angular-translate-loader-url');

angular
    .module('portal')
    .config(translaterConfig);


// as service http://angular-translate.github.io/docs/#/guide/03_using-translate-service
// Using with params in strings http://angular-translate.github.io/docs/#/guide/06_variable-replacement
/** @ngInject */
function translaterConfig($translateProvider) {
    $translateProvider.useUrlLoader('/api/translation.json');
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escape'); // http://angular-translate.github.io/docs/#/guide/19_security
}

module.exports = translaterConfig;