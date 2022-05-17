'use strict';

var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .directive('hostedPortalForm', hostedPortalFormDirective);

/** @ngInject */
function hostedPortalFormDirective() {
    var directive = {
        restrict: 'E',
        templateUrl: '/templates/components/pageComponents/hostedPortalForm/hostedPortalForm.html',
        scope: {
            key: '@'
        },
        controller: hostedPortalFormCtrl,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function hostedPortalFormCtrl($http, Node) {
        var vm = this;
        vm.loading = true;
        vm.form = {};

        Node.query({identifierType: 'GBIF_PARTICIPANT', limit: 500}).$promise
            .then(function(data) {
              vm.participantCountries = _.sortBy(_.filter(data.results, function(e) {
                if (e.participationStatus === 'OBSERVER' || e.participationStatus === 'FORMER') return false;
                if (e.type !== 'COUNTRY') return false;
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
          $http.post('/api/tools/hosted-portals', {form: form}, {}).then(function(response) {
              vm.referenceId = response.data.referenceId;
              vm.state = 'SUCCESS';
              console.log('juhuu');
          }, function() {
              vm.state = 'FAILED';
              console.log('øv');
          });
        };
        vm.typeChanged = function() {
          delete vm.form.type_contact;
        };
    }
}

module.exports = hostedPortalFormDirective;

