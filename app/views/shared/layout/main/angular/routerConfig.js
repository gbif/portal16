var angular = require('angular');
require('angular-ui-router'); 
angular
    .module('portal')
    .config(routerConfig);
    
// The annotation is neccessary to work with minification and ngAnnotate when using as a commonjs Module - http://chrisdoingweb.com/blog/minifying-browserified-angular-modules/
/** @ngInject */
function routerConfig($stateProvider, $locationProvider) {
    //TODO We need a way to handle routes when refreshing. Server needs to know about these routes.
    $stateProvider
        .state('testerpage', {
            url: '/tester',
            templateUrl: '/templates/shared/layout/main/main.html',
            controller: 'MainController',
            controllerAs: 'main'
        })
    ;
    //if unknown route then goto server instead of redirecting to home: $urlRouterProvider.otherwise('/');

    //TODO how does this work with ie9 and browsers without history api https://docs.angularjs.org/error/$location/nobase
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false,
        rewriteLinks: false
    });
}

module.exports = routerConfig;
