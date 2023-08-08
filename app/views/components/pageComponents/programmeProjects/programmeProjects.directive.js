'use strict';

var angular = require('angular'),
  _ = require('lodash');

angular
  .module('portal')
  .directive('programmeProjects', programmeProjectsDirective);

/** @ngInject */
function programmeProjectsDirective() {
  var directive = {
    restrict: 'E',
    templateUrl: '/templates/components/pageComponents/programmeProjects/programmeProjects.html',
    scope: {
      programmeId: '@',
      tableStyle: '@'
    },
    controller: programmeProjectsCtrl,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;

  /** @ngInject */
  function programmeProjectsCtrl(ResourceSearch, env) {
    var vm = this;
    vm.loading = true;
    vm.locale = gb.locale;
    vm.imageCache = env.imageCache;
    vm.state = {
      sortType: 'title'
    };


    ResourceSearch.query({ programmeId: vm.programmeId, contentType: 'project', limit: 500 }, function (data) {
      // filter results since we ask by free text query. the API for some reason do not support querying by programme id. This would be nice to have
      data.results = _.filter(data.results, function (e) {
        return _.get(e, 'programme.id') === vm.programmeId;
      });
      _.forEach(data.results, function (e) {
        e.call = _.get(e.call, 'title');
      });
      data.count = data.results.length;
      vm.projects = data;
    });

    vm.preventBubbling = function (event) {
      event.stopPropagation();
      return false;
    };

    vm.goto = function(url) {
      window.location.href = url;
  };
  }
}

module.exports = programmeProjectsDirective;

