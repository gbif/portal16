'use strict';

var angular = require('angular'),
  _ = require('lodash');

angular
  .module('portal')
  .directive('translatorsList', translatorsListDirective);

/** @ngInject */
function translatorsListDirective() {
  var directive = {
    restrict: 'E',
    templateUrl: '/templates/components/pageComponents/translatorsList/translatorsList.html',
    scope: {
      settings: '@',
      title: '@',
    },
    controller: translatorsListCtrl,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;

  /** @ngInject */
  function translatorsListCtrl(GraphQLGet) {
    var vm = this;
    vm.loading = true;
    vm.locale = gb.locale;
    vm.config = {};

    try {
      vm.config = JSON.parse(vm.settings);
    } catch (e) {
      console.warn('Could not parse settings', e);
    }
    vm.tableStyle = vm.config.tableStyle || '';

    var response = GraphQLGet.get({
      query: `query {
      directoryTranslators(limit: 1000) {
        results {
          Person {
            firstName
            surname
            languages
            countryCode
            orcidId
            certifications {
              year
            }
          }
        }
      }
    }`});

    response.$promise.then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      vm.results = response.data.directoryTranslators.results;
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  }
}

module.exports = translatorsListDirective;

