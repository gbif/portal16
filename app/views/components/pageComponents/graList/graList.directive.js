'use strict';

var angular = require('angular'),
  _ = require('lodash');

angular
  .module('portal')
  .directive('graList', graListDirective);

/** @ngInject */
function graListDirective() {
  var directive = {
    restrict: 'E',
    templateUrl: '/templates/components/pageComponents/graList/graList.html',
    scope: {
      settings: '@',
      title: '@',
    },
    controller: graListCtrl,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;

  /** @ngInject */
  function graListCtrl(GraphQLGet) {
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
      graWinners:directoryAwardWinners(award: ["GRA"]) {
        firstName
        surname
        countryCode 
        orcidId
        roles {
          award
          term {
            start
          }
        }
      } 
    }`});

    response.$promise.then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      vm.results = response.data.graWinners;
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });

    vm.asYear = function (year) {
      return year.split('-')[0];
    }
  }
}

module.exports = graListDirective;

