'use strict';

var angular = require('angular'),
  _ = require('lodash');

angular
  .module('portal')
  .directive('mentorsList', mentorsListDirective);

/** @ngInject */
function mentorsListDirective() {
  var directive = {
    restrict: 'E',
    templateUrl: '/templates/components/pageComponents/mentorsList/mentorsList.html',
    scope: {
      settings: '@',
      title: '@',
    },
    controller: mentorsListCtrl,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;

  /** @ngInject */
  function mentorsListCtrl(GraphQLGet) {
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
      directoryMentors {
        results {
          award
          Person {
            firstName
            surname
            email
            countryCode
            areasExpertise
          }
        }
      }
    }`});

    response.$promise.then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      vm.results = response.data.directoryMentors.results;
    }, function errorCallback(response) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });
  }
}

module.exports = mentorsListDirective;

