'use strict';
var angular = require('angular');

angular
  .module('portal')
  .controller('occurrenceKeyClusterCtrl', occurrenceKeyClusterCtrl);

/** @ngInject */
function occurrenceKeyClusterCtrl($state, $stateParams, OccurrenceRelated) {
  var vm = this;
  vm.$state = $state;
  vm.key = $stateParams.key;
  vm.similarRecords = OccurrenceRelated.get({id: vm.key});

  vm.similarRecords.$promise.then(function(data) {
    data.occurrences.forEach(function(e) {
      if (!e.occurrence.multimedia) return;
      // select first image
      for (var i = 0; i < e.occurrence.multimedia.length; i++) {
        if (e.occurrence.multimedia[i].type == 'StillImage') {
          e.occurrence._image = e.occurrence.multimedia[i];
          return;
        }
      }
    });
  });

  vm.hasData = function() {
    return !!vm.similarRecords.occurrences;
  };
}

module.exports = occurrenceKeyClusterCtrl;
