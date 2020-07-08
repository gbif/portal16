'use strict';
var angular = require('angular');

angular
  .module('portal')
  .controller('occurrenceKeyClusterCtrl', occurrenceKeyClusterCtrl);

/** @ngInject */
function occurrenceKeyClusterCtrl($state, $stateParams, OccurrenceRelated, OccurrenceFragment) {
  var vm = this;
  vm.$state = $state;
  vm.key = $stateParams.key;
  vm.similarRecords = OccurrenceRelated.get({id: vm.key});

  vm.similarRecords.$promise.then(function(data) {
    data.relatedOccurrences.forEach(function(e) {
      e.occurrence.fragment = OccurrenceFragment.get({id: e.occurrence.gbifId});
      if (e.reasons) {
        e.reasons = e.reasons.split(',');
      }
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
    return !!vm.similarRecords.relatedOccurrences;
  };

  var ggbn = ['Amplification', 'MaterialSample', 'Permit', 'Preparation', 'Preservation'];
  vm.isSequenced = function(fragment) {
    for (var i = 0; i < ggbn.length; i++) {
      var ext = fragment.extensions['http://data.ggbn.org/schemas/ggbn/terms/' + ggbn[i]];
      if (ext && ext.length > 0) return true;
    }
    return false;
  };
}

module.exports = occurrenceKeyClusterCtrl;
