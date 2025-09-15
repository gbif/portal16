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

angular
  .module('portal')
  .controller('occurrenceDownloadCustomCtrl', occurrenceDownloadCustomCtrl);

/** @ngInject */
// eslint-disable-next-line max-len
function occurrenceDownloadCustomCtrl($cookies, $scope, AUTH_EVENTS, env, $httpParamSerializer, $http, OccurrenceFilter, endpoints, $uibModal, enums, toastService, $sessionStorage, User, DownloadSpeed, URL_PREFIX, $location, $rootScope) {
  var vm = this;
  vm.downloadFormats = enums.downloadFormats;
  vm.state = OccurrenceFilter.getOccurrenceData();
  vm.largeDownloadOffset = 1048576; // above this size, it is not possible to handle it in excel
  vm.veryLargeDownloadOffset = 50000000; // above this size data wrangling is not trivial, i.e. ordinary databases like access, filemaker etc. will not longer suffice
  vm.unzipFactor = 6.8; // based on a 47 mb file being 316 mb unzipped
  vm.estKbDwcA = 0.165617009; // based on 111GB for 702777671 occurrences in “DWCA"
  vm.estKbCsv = 0.065414979; // based on 44GB for 705302432 occurrences in CSV
  vm.input = typeof gb.predicate === 'string' ? decodeURIComponent(gb.predicate) : '';
  vm.invalidInput = false;
  vm.predicateLoaded = false;
  vm.inEditMode = vm.input.length < 4;

  vm.checklistMapping = JSON.parse(JSON.stringify(env.checklistMapping));
  // select checklistKey from url search param if available and fallback to  env.defaultChecklist
  vm.selectedChecklist = $location.search().checklistKey || env.defaultChecklist;
  // if selected checklist doens't exist in mapping , then use default
  if (!vm.checklistMapping[vm.selectedChecklist]) {
    vm.selectedChecklist = env.defaultChecklist;
  }
  vm.checklistOptions = Object.keys(env.checklistMapping);
  
  
  var tabs = ['create', 'about'];

  $scope.$on('$includeContentError', function(event, args) {
    vm.invalidInput = true;
    vm.predicateLoaded = true;
  });

  vm.editModeChanged = function() {
    vm.predicateLoaded = false;
    vm.prettify();
  };

  vm.prettify = function(str) {
    try {
      var jsonInput = JSON.parse(str || vm.input);
      vm.input = JSON.stringify(jsonInput, null, 2);
      vm.invalidInput = false;
      vm.predicateLoaded = false;
    } catch (err) {
      if (!str && vm.input && vm.input.length > 0) {
        var transformedInput = vm.input.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:/g, '"$2": ');
        vm.prettify(transformedInput);
      } else {
        vm.invalidInput = true;
      }
    }
  };
  if (vm.input) {
    vm.prettify(vm.input);
  }

  vm.getSerializedQuery = function() {
    return $httpParamSerializer({predicate: vm.input});
  };

  vm.tooLargeForGet = function() {
    return JSON.stringify(vm.input).length > 2000;
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
      var jsonPredicate = JSON.parse(vm.input);
      var data = {predicate: jsonPredicate};
      data.format = format;
      data.checklistKey = vm.selectedChecklist;
      data.notification_address = email;
      var source = $cookies.get('downloadSource');
      var downloadUrl = endpoints.download + '/predicate';
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


module.exports = occurrenceDownloadCustomCtrl;

