/* eslint-disable no-undef */
'use strict';

var angular = require('angular'),
  _ = require('lodash');

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
    var siteConfig = {};

    ReactDOM.render(
      React.createElement(gbifReactComponents.OccurrenceSearch, {
        style: {height: 'calc(100vh - 3.571428571425rem)'},
        theme: siteTheme,
        config: siteConfig
      }),
      document.getElementById('react-root')
    );
  };

  vm.mountit();
}

module.exports = betaSearchCtrl;

