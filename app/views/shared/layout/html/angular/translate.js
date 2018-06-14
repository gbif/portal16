var angular = require('angular');
require('angular-translate');
require('angular-translate-loader-url');
require('angular-translate-interpolation-messageformat');

angular
    .module('portal')
    .config(translaterConfig);


// as service http://angular-translate.github.io/docs/#/guide/03_using-translate-service
// Using with params in strings http://angular-translate.github.io/docs/#/guide/06_variable-replacement
/** @ngInject */
function translaterConfig($translateProvider, BUILD_VERSION, LOCALE) {
    $translateProvider.useUrlLoader('/api/translation.json?v=' + BUILD_VERSION);
    // https://angular-translate.github.io/docs/#/guide/14_pluralization
    // $translateProvider.addInterpolation('$translateMessageFormatInterpolation');
    $translateProvider.useMessageFormatInterpolation();
    $translateProvider.preferredLanguage(LOCALE);
    $translateProvider.fallbackLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escape'); // http://angular-translate.github.io/docs/#/guide/19_security
}

module.exports = translaterConfig;
