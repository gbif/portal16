/**
 * search types?
 * auto complete
 * integer is [between, below, above]
 * date interval etc
 * enum list, multiselect
 */
'use strict';
var angular = require('angular');
require('../downloadSpeed.service');
var examples = require('./examples.json');

function htmlDecode(input) {
  var doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent;
}

angular
  .module('portal')
  .controller('occurrenceDownloadSqlCtrl', occurrenceDownloadSqlCtrl);

/** @ngInject */
// eslint-disable-next-line max-len
function occurrenceDownloadSqlCtrl($state, $cookies, $scope, AUTH_EVENTS, $httpParamSerializer, $http, OccurrenceFilter, endpoints, $uibModal, enums, toastService, $sessionStorage, User, DownloadSpeed, URL_PREFIX, $location, $rootScope, SqlFormatting) {
  var vm = this;
  vm.stateParams = $state;
  vm.downloadFormats = enums.downloadFormats;
  vm.state = OccurrenceFilter.getOccurrenceData();
  vm.largeDownloadOffset = 1048576; // above this size, it is not possible to handle it in excel
  vm.veryLargeDownloadOffset = 50000000; // above this size data wrangling is not trivial, i.e. ordinary databases like access, filemaker etc. will not longer suffice
  vm.unzipFactor = 6.8; // based on a 47 mb file being 316 mb unzipped
  vm.estKbDwcA = 0.165617009; // based on 111GB for 702777671 occurrences in “DWCA"
  vm.estKbCsv = 0.065414979; // based on 44GB for 705302432 occurrences in CSV
  vm.input = typeof gb.sql === 'string' ? htmlDecode(decodeURIComponent(gb.sql)) : '';
  vm.invalidInput = false;
  vm.sqlLoaded = false;
  vm.inEditMode = vm.input.length < 4;
  vm.errorMessage = '';
  vm.examples = examples;
  var tabs = ['create', 'about'];

  $scope.$on('$includeContentError', function(event, args) {
    vm.invalidInput = true;
    vm.sqlLoaded = true;
  });

  vm.editModeChanged = function() {
    vm.sqlLoaded = false;
    vm.prettify();
  };

  vm.selectExample = function() {
    var example = vm.examples.find(function(ex) {
      return ex.name === vm.selectedExample;
    });
    vm.input = example.sql;
    vm.prettify();
  };

  vm.format = function(str) {
    SqlFormatting.query({sql: str}, function(response) {
      if (response.error) {
        vm.invalidInput = true;
        vm.errorMessage = response.error;
      } else {
        vm.invalidInput = false;
        vm.errorMessage = undefined;
        vm.input = response.sql;
      }
    }, function() {
      vm.invalidInput = true;
    });
  };

  vm.prettify = function(str) {
    vm.format(str || vm.input);
  };
  vm.prettify();

  vm.getSerializedQuery = function() {
    return $httpParamSerializer({sql: vm.input});
  };

  // keep track of whether the user is logged in or not
  function setLoginState() {
    vm.hasUser = !!$sessionStorage.user;
  }
  $scope.$on(AUTH_EVENTS.LOGOUT_SUCCESS, function() {
    setLoginState();
  });
  $scope.$on(AUTH_EVENTS.LOGIN_SUCCESS, function() {
    setLoginState();
  });
  $scope.$on(AUTH_EVENTS.USER_UPDATED, function() {
    setLoginState();
  });
  User.loadActiveUser();
  setLoginState();

  // modals
  vm.open = function (format) {
    vm.state.table.$promise.then(function () {
      vm.openDownloadModal(format);
    });
  };

  vm.openDownloadModal = function (format) {
    var modalInstance = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      controllerAs: '$ctrl',
      resolve: {
        options: function () {
          return {format: format};
        }
      }
    });

    modalInstance.result.then(function (downloadOptions) {
      vm.startDownload(downloadOptions.format, downloadOptions.username, downloadOptions.password, downloadOptions.email);
    }, function () {
      // user clicked cancel
    });
  };

  vm.startDownload = function (format, username, password, email) {
    try {
      var data = {sql: vm.input};
      data.format = format;
      data.notification_address = email;
      var source = $cookies.get('downloadSource');
      var downloadUrl = endpoints.download + '/sql';
      if (source) {
        downloadUrl += '?source=' + encodeURIComponent(source);
      }
      $http.post(downloadUrl, data).then(function (response) {
        window.location.href = response.data.downloadKey;
      }, function (err) {
        // TODO alert user of failure
        if (err.status === 401) {
          // unauthorized
          toastService.error({translate: 'phrases.errorNotAuthorized'});
        } else if (err.status === 413) {
          // Query too large for the API
          toastService.error({translate: 'phrases.payloadTooLarge'});
        } else if (err.status === 420) {
          // User throttled
          toastService.error({translate: 'occurrenceSearch.errorUserThrottled', readMore: URL_PREFIX + '/restricted'});
        } else {
          toastService.error({translate: 'phrases.criticalErrorMsg'});
        }
      });
    } catch (err) {
      toastService.error({translate: 'phrases.criticalErrorMsg'});
    }
  };

  function updateTab() {
    vm.hash = tabs.indexOf($location.hash()) > -1 ? $location.hash() : 'create';
  }
  updateTab();

  $rootScope.$on('$locationChangeSuccess', function() {
      updateTab();
  });
}

angular.module('portal').controller('ModalInstanceCtrl', function ($uibModalInstance, options) {
  var $ctrl = this;
  // $ctrl.username;
  // $ctrl.password;
  // $ctrl.email;
  $ctrl.options = options;

  $ctrl.ok = function () {
    $uibModalInstance.close({
      // username: $ctrl.username,
      // password: $ctrl.password,
      // email: $ctrl.email,
      format: $ctrl.options.format
    });
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});


module.exports = occurrenceDownloadSqlCtrl;

