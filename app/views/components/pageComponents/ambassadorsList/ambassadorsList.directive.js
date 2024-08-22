'use strict';

var angular = require('angular'),
  _ = require('lodash');

angular
  .module('portal')
  .directive('ambassadorsList', ambassadorsListDirective);

/** @ngInject */
function ambassadorsListDirective() {
  var directive = {
    restrict: 'E',
    templateUrl: '/templates/components/pageComponents/ambassadorsList/ambassadorsList.html',
    scope: {
      settings: '@',
      title: '@',
    },
    controller: ambassadorsListCtrl,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;

  /** @ngInject */
  function ambassadorsListCtrl(GraphQLGet) {
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
      directoryAmbassadors(limit: 1000) {
        results {
          term {
            start
          }
          Person {
            firstName
            surname
            email
            orcidId
            institutionName
            countryCode
            areasExpertise
          }
        }
      }
    }`});

    response.$promise.then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      vm.results = response.data.directoryAmbassadors.results;
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  }
}

module.exports = ambassadorsListDirective;

