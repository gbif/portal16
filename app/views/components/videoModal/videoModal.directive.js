'use strict';

var angular = require('angular');
angular
  .module('portal')
  .directive('videoModal', videoModalDirective);

/** @ngInject */
function videoModalDirective(BUILD_VERSION) {
  var directive = {
    restrict: 'A',
    transclude: true,
    templateUrl: '/templates/components/videoModal/videoModal.html?v=' + BUILD_VERSION,
    scope: {
      source: '='
    },
    replace: true,
    controller: videoModal,
    controllerAs: 'vm',
    bindToController: true
  };

  return directive;

  /** @ngInject */
  function videoModal($mdDialog) {
    var vm = this;

    vm.showPopup = function (ev) {
      $mdDialog.show({
        locals: {data: {videoSource: vm.source}},
        controller: DialogController,
        templateUrl: 'videoPopup.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        transclude: true,
        clickOutsideToClose: true
        // fullscreen: true
      })
        .then(function (answer) {
          // dialog closed
        }, function () {
          // Dialog cancelled
        });
    };

    function DialogController($scope, data) {
      $scope.videoSource = data.videoSource;
      $scope.getMaxWidth = function () {
        var widthFromHeight = (document.body.clientHeight * 0.8) / 0.56;
        var maxPopupWidth = Math.min(document.body.clientWidth * 0.8, widthFromHeight);
        return {
          'max-width': maxPopupWidth + 'px'
        };
      };
    }
  }
}

module.exports = videoModalDirective;

