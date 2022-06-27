'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('biodataSurvey', biodataSurveyDirective);

/** @ngInject */
function biodataSurveyDirective(BUILD_VERSION) {
    var directive = {
        restrict: 'A',
        templateUrl: '/api/template/biodatasurvey.html?v=' + BUILD_VERSION,
        scope: {},
        replace: true,
        controller: survey,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function survey($scope, $localStorage, AUTH_EVENTS, User, $uibModal, $location, $timeout) {
    var vm = this;
    vm.show = false;
    
    vm.maybeLater = function() {
        delete $localStorage.has_responded_to_survey_popup;
        $localStorage.has_postponed_survey_popup = Date.now();
        vm.show = false;
    };
    vm.reject = function() {
        $localStorage.has_responded_to_survey_popup = true;
        vm.show = false;
    };
    vm.accept = function() {
        $localStorage.has_responded_to_survey_popup = true;
        vm.show = false;
        return true;
    };
    var now = Date.now();
    var oneHourAgo = now - 3600000;
    var postponed = $localStorage.has_postponed_survey_popup ? $localStorage.has_postponed_survey_popup : 0;
    if ($location.path().indexOf('/occurrence') === 0 && !$localStorage.has_responded_to_survey_popup && postponed < oneHourAgo) {
        $timeout(openSurveymodal, 5000);
    }
   

    function openSurveymodal() {
        vm.show = true;
}
}
}

module.exports = biodataSurveyDirective;

