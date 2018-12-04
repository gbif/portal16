'use strict';

var user = function() {
  this.userName = 'gbif_e2e_user';
  this.password = 'gbif_e2e_user';
  this.passwordUnknown = 'gbif_e2e_user' + Math.random();
  this.profileUrl = '/user/profile';
  this.userDownloadsUrl = '/user/download';
  this.occurrenceSearchDownloadUrl = '/occurrence/download?taxon_key=6';
  this.invalidLoginElem = element(by.css('[ng-if="vm.invalidLogin"]'));

  this.mainPageSignIn = element(by.css('.userLogin button.gb-button--brand'));
  this.mainPageSignInText = 'SIGN IN';

  this.formUsername = element(by.model('vm.username'));
  this.formPassword = element(by.model('vm.password'));

  this.profileTab = element(by.css('main nav li:first-of-type'));
  this.profileTabText = 'PROFILE';

  this.downloadCsvButton = element(by.css('[ng-click="occDownload.open(\'SIMPLE_CSV\')"'));
  this.modalProceed = element(by.css('#occurrenceDownloadWarningProceed'));
  this.modalUnderstood = element(by.css('#occurrenceDownloadUnderstoodTerms'));

  // user downloads
  this.firstCancelButton = element.all(by.css('[ng-click="userDownloads.cancelDownload(download.key)"]')).first();
};

module.exports = new user();
