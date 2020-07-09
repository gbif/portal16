'use strict';
var angular = require('angular');
var _ = require('lodash');

angular
  .module('portal')
  .controller('occurrenceKeyClusterCtrl', occurrenceKeyClusterCtrl);

/** @ngInject */
function occurrenceKeyClusterCtrl($q, $state, $filter, $stateParams, Occurrence, OccurrenceRelated, OccurrenceFragment) {
  var vm = this;
  vm.$state = $state;
  vm.key = $stateParams.key;

  vm.currentOccurrence = Occurrence.get({id: vm.key});
  vm.similarRecords = OccurrenceRelated.get({id: vm.key});

  $q.all({
    current: Occurrence.get({id: vm.key}).$promise,
    similarRecords: vm.similarRecords.$promise
  }).then(function(res) {
    res.similarRecords.relatedOccurrences.forEach(function(e) {
      e.occurrence.fragment = OccurrenceFragment.get({id: e.occurrence.gbifId});
      e.occurrence._fullRecord = Occurrence.get({id: e.occurrence.gbifId});
      e.occurrence._fullRecord.$promise.then(function(response) {
        e._compare = vm.getFields(res.current, response);
      });

      if (!e.occurrence.media) return;
      // select first image
      for (var i = 0; i < e.occurrence.media.length; i++) {
        if (e.occurrence.media[i].type == 'StillImage') {
          e.occurrence._image = e.occurrence.media[i];
          return;
        }
      }
    });

    if (res.similarRecords.currentOccurrence) {
      res.similarRecords.currentOccurrence.fragment = OccurrenceFragment.get({id: res.similarRecords.currentOccurrence.gbifId});
      if (res.similarRecords.currentOccurrence.media) {
        // select first image
        for (var i = 0; i < res.similarRecords.currentOccurrence.media.length; i++) {
          if (res.similarRecords.currentOccurrence.media[i].type == 'StillImage') {
            res.similarRecords.currentOccurrence._image = res.similarRecords.currentOccurrence.media[i];
            return;
          }
        }
      }
    }
  });

  vm.hasData = function() {
    return vm.similarRecords.relatedOccurrences && vm.similarRecords.relatedOccurrences.length > 0;
  };

  vm.isLoading = function() {
    return !vm.similarRecords.relatedOccurrences;
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

  // eslint-disable-next-line max-len
  var exclude = ['gbifID', 'key', 'datasetKey', 'publishingOrgKey', 'installationKey', 'protocol', 'lastCrawled', 'lastParsed', 'crawlId', 'lastInterpreted', 'kingdomKey', 'phylumKey', 'classKey', 'orderKey', 'familyKey', 'genusKey', 'speciesKey', 'acceptedTaxonKey'];
  vm.getFields = function(current, other) {
    var candidateKeys = _.difference(_.union(Object.keys(current), Object.keys(other)), exclude);
    candidateKeys.sort();
    var keys = [];
    candidateKeys.forEach(function(key) {
      var currentType = typeof current[key];
      var otherType = typeof other[key];
      if (otherType === 'string' || otherType === 'number' || currentType === 'string' || currentType === 'number') {
        keys.push({
          key: key,
          current: current[key],
          other: other[key],
          isDifferent: current[key] !== other[key]
        });
      }
    });
    console.log(keys);
    return keys;
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
