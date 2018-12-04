'use strict';

describe('User', function() {
    var user;

    beforeEach(function() {
        user = require('./po/user.po.js');
    });

    it('should show a login form and not profile when unknown user', function() {
        browser.get(user.profileUrl);
        expect(user.mainPageSignIn.getText()).toEqual('SIGN IN');
    });

    it('should show a login form for unknown users on occurrence download', function() {
        browser.get(user.occurrenceSearchDownloadUrl);
        expect(user.mainPageSignIn.getText()).toEqual('SIGN IN');
    });

    it('should reject login on wrong password', function() {
        browser.get(user.profileUrl);
        user.formUsername.sendKeys(user.userName);
        user.formPassword.sendKeys(user.passwordUnknown);
        user.mainPageSignIn.click();
        expect(user.invalidLoginElem.isPresent()).toBe(true);
    });

    it('should be possible to login', function() {
        browser.get(user.profileUrl);
        user.formUsername.sendKeys(user.userName);
        user.formPassword.sendKeys(user.password);
        user.mainPageSignIn.click();
        expect(user.invalidLoginElem.isPresent()).toBe(false);
        expect(user.profileTab.getText()).toEqual(user.profileTabText);
    });

    it('should be possible to start a download when logged in', function() {
        browser.get(user.occurrenceSearchDownloadUrl);
        user.downloadCsvButton.click();
        // start download adn cancel it
        user.modalProceed.isPresent().then(function(present) {
            if (present) {
                // there is a lot of occurrences and the website warns us so. this is not the case for dev where these is close to no data
                user.modalProceed.click();
                expect(user.modalUnderstood.isPresent()).toBe(true);
                user.modalUnderstood.click().then(waitUntilURLContains('/occurrence/download/', 20000));
            } else {
                expect(user.modalUnderstood.isPresent()).toBe(true);
                user.modalUnderstood.click().then(waitUntilURLContains('/occurrence/download/', 20000));
            }
        });
    });'use strict';

    describe('User', function() {
      var user;
    
      beforeEach(function() {
        user = require('./po/user.po.js');
      });
    
      it('should show a login form and not profile when unknown user', function() {
        browser.get(user.profileUrl);
        expect(user.mainPageSignIn.getText()).toEqual('SIGN IN');
      });
    
      it('should show a login form for unknown users on occurrence download', function() {
        browser.get(user.occurrenceSearchDownloadUrl);
        expect(user.mainPageSignIn.getText()).toEqual('SIGN IN');
      });
    
      it('should reject login on wrong password', function() {
        browser.get(user.profileUrl);
        user.formUsername.sendKeys(user.userName);
        user.formPassword.sendKeys(user.passwordUnknown);
        user.mainPageSignIn.click();
        expect(user.invalidLoginElem.isPresent()).toBe(true);
      });
    
      it('should be possible to login', function() {
        browser.get(user.profileUrl);
        user.formUsername.sendKeys(user.userName);
        user.formPassword.sendKeys(user.password);
        user.mainPageSignIn.click();
        expect(user.invalidLoginElem.isPresent()).toBe(false);
        expect(user.profileTab.getText()).toEqual(user.profileTabText);
      });
    
      it('should be possible to start a download when logged in', function() {
        browser.get(user.occurrenceSearchDownloadUrl);
        user.downloadCsvButton.click();
        // start download adn cancel it
        user.modalProceed.isPresent().then(function(present) {
          if (present) {
            // there is a lot of occurrences and the website warns us so. this is not the case for dev where these is close to no data
            user.modalProceed.click();
            expect(user.modalUnderstood.isPresent()).toBe(true);
            user.modalUnderstood.click().then(waitUntilURLContains('/occurrence/download/', 20000));
          } else {
            expect(user.modalUnderstood.isPresent()).toBe(true);
            user.modalUnderstood.click().then(waitUntilURLContains('/occurrence/download/', 20000));
          }
        });
      });
    
      it('should be possible to see and cancel your own downloads', function() {
        browser.get(user.userDownloadsUrl);
        expect(user.firstCancelButton.isPresent()).toBe(true);
        user.firstCancelButton.click();
        expect(user.firstCancelButton.isPresent()).toBe(false);
      });
    });
    
    function waitUntilURLContains(str, waitDelay) {
      var fn = function() {
        return browser.driver.wait(function() {
          return browser.driver.getCurrentUrl().then(function(url) {
            return url.includes(str);
          });
        }, waitDelay);
      };
      return fn.bind(null, str);
    }
    

    it('should be possible to see and cancel your own downloads', function() {
        browser.get(user.userDownloadsUrl);
        expect(user.firstCancelButton.isPresent()).toBe(true);
        user.firstCancelButton.click();
        expect(user.firstCancelButton.isPresent()).toBe(false);
    });
});

function waitUntilURLContains(str, waitDelay) {
    var fn = function() {
        return browser.driver.wait(function() {
        return browser.driver.getCurrentUrl().then(function(url) {
            return url.includes(str);
        });
        }, waitDelay);
    };
    return fn.bind(null, str);
}
