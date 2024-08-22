'use strict';

var angular = require('angular'),
  _ = require('lodash');

angular
  .module('portal')
  .directive('ebbeList', ebbeListDirective);

/** @ngInject */
function ebbeListDirective() {
  var directive = {
    restrict: 'E',
    templateUrl: '/templates/components/pageComponents/ebbeList/ebbeList.html',
    scope: {
      settings: '@',
      title: '@',
    },
    controller: ebbeListCtrl,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;

  /** @ngInject */
  function ebbeListCtrl(GraphQLGet) {
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
      ebbeWinners:directoryAwardWinners(award: ["EBBE1ST", "EBBE2ND", "EBBE3RD"]) {
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
      vm.results = response.data.ebbeWinners;
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });

    // takes an iso string and returns a year
    vm.asYear = function (year) {
      return year.split('-')[0];
    }
  }
}

module.exports = ebbeListDirective;

