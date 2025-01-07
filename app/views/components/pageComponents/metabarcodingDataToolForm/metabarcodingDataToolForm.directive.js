'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('metabarcodingDataToolForm', metabarcodingDataToolFormDirective);

/** @ngInject */
function metabarcodingDataToolFormDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/components/pageComponents/metabarcodingDataToolForm/metabarcodingDataToolForm.html',
        scope: {
            key: '@'
        },
        controller: metabarcodingDataToolFormCtrl,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function metabarcodingDataToolFormCtrl($http, Node) {
        var vm = this;
        vm.loading = true;
        vm.form = {};

        Node.query({identifierType: 'GBIF_PARTICIPANT', limit: 500}).$promise
            .then(function(data) {
              vm.participantCountries = _.sortBy(_.filter(data.results, function(e) {
                if (e.participationStatus === 'OBSERVER' || e.participationStatus === 'FORMER') return false;
                //if (e.type !== 'COUNTRY') return false;
                return true;
              }), 'participantTitle');
              vm.participantCountriesMap = _.keyBy(vm.participantCountries, 'key');
            });
        // $http({
        //     method: 'get',
        //     url: '/api/species/' + vm.key + '/hostedPortalForm'
        // }).then(function(res) {
        //     vm.loading = false;
        //     vm.hostedPortalFormTaxonid = _.get(res, 'data.hostedPortalFormIdentifier[0].id');
        //     vm.category = _.get(res, 'data.distribution.threat') || 'NOT_EVALUATED';
        //     vm.sourceLink = _.get(res, 'data.references');
        // }).catch(function(err) {
        //     vm.loading = false;
        // });
        vm.createSuggestion = function() {
          var form = _.assign({}, vm.form, {participant: vm.participantCountriesMap[vm.form.participant]});
          vm.state = 'PENDING';
          $http.post('/api/tools/metabarcoding-data-tool-form', {form: form}, {}).then(function(response) {
              vm.state = 'SUCCESS';
          }, function() {
              vm.state = 'FAILED';
          });
        };

        vm.restart = function() {
          vm.form = {};
          vm.state = undefined;
        };
    }
}

module.exports = metabarcodingDataToolFormDirective;

