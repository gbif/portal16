'use strict';
var angular = require('angular');

angular
  .module('portal')
  .controller('occurrenceKeyClusterCtrl', occurrenceKeyClusterCtrl);

/** @ngInject */
function occurrenceKeyClusterCtrl($state, $filter, $stateParams, OccurrenceRelated, OccurrenceFragment) {
  var vm = this;
  vm.$state = $state;
  vm.key = $stateParams.key;
  vm.similarRecords = OccurrenceRelated.get({id: vm.key});

  vm.similarRecords.$promise.then(function(data) {
    data.relatedOccurrences.forEach(function(e) {
      e.occurrence.fragment = OccurrenceFragment.get({id: e.occurrence.gbifId});
      if (!e.occurrence.media) return;
      // select first image
      for (var i = 0; i < e.occurrence.media.length; i++) {
        if (e.occurrence.media[i].type == 'StillImage') {
          e.occurrence._image = e.occurrence.media[i];
          return;
        }
      }
    });
  });

  vm.hasData = function() {
    return !!vm.similarRecords.relatedOccurrences;
  };

  vm.formatCoordinates = function(lat, lng) {
    if (angular.isUndefined(lat) || angular.isUndefined(lng)) {
        return '';
    } else {
        var la = $filter('number')(Math.abs(lat), 1) + (lat < 0 ? 'S' : 'N');
        var lo = $filter('number')(Math.abs(lng), 1) + (lng < 0 ? 'W' : 'E');
        return la + ', ' + lo;
    }
};

  var ggbn = ['Amplification', 'MaterialSample', 'Permit', 'Preparation', 'Preservation'];
  vm.isSequenced = function(extensions) {
    if (!extensions) return false;
    for (var i = 0; i < ggbn.length; i++) {
      var ext = extensions['http://data.ggbn.org/schemas/ggbn/terms/' + ggbn[i]];
      if (ext && ext.length > 0) return true;
    }
    return false;
  };
}

module.exports = occurrenceKeyClusterCtrl;
