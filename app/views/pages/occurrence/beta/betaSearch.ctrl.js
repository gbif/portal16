/* eslint-disable no-undef */
'use strict';

var angular = require('angular');

angular
  .module('portal')
  .controller('betaSearchCtrl', betaSearchCtrl);

/** @ngInject */
// eslint-disable-next-line max-len
function betaSearchCtrl() {
  var vm = this;
  vm.mountit = function () {
    var primaryColor = '#71b171';
    var isSquared = true;

    if (primaryColor) {
      // eslint-disable-next-line no-undef
      var siteTheme = gbifReactComponents.themeBuilder.extend({
        baseTheme: 'light',
        extendWith: {
          dense: true,
          fontSize: '14px',
          primary: primaryColor,
          borderRadius: isSquared ? 0 : 3
        }
      });
    }
    var siteConfig = {
      routes: {
        occurrenceSearch: {
          route: gb.urlPrefix + '/occurrence-search/beta'
        }
      },
      theme: siteTheme,
      locale: gb.locale
    };

    ReactDOM.render(
      React.createElement(gbifReactComponents.OccurrenceSearch, {
        style: {height: 'calc(100vh - 86px)'},
        siteConfig: siteConfig
      }),
      document.getElementById('react-root')
    );
  };

  vm.mountit();
}

module.exports = betaSearchCtrl;

