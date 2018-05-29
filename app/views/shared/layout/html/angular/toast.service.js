'use strict';

var angular = require('angular');

(function() {
    angular
        .module('portal')
        .service('toastService', function(NAV_EVENTS, toastr, $rootScope, $translate) {
            // TODO errors needs translating
            var defaultError = {
                feedback: true,
                status: true,
                message: 'An error occurred. Please try again.'
            };

            var defaultPartialFailure = {
                feedback: true,
                status: true,
                message: 'Not all of the page could be shown. If the problem persists please let us know.'
            };

            var defaultWarning = {
                feedback: true,
                status: true,
                message: 'We are having issues showing this page.'
            };

            var defaultPartialResult = {
                feedback: false,
                status: true,
                message: 'You are seeing a partial result. This is likely due to busy servers'
            };

            var defaultInfo = {
                feedback: false,
                status: false
            };

            // $translate('notifications.defaultErrorMessage').then(function (translation) {
            //    defaultMessages.defaultErrorMessage = translation;
            // });
            // $translate('notifications.defaultErrorMessage').then(function (translation) {
            //    defaultSettings.defaultErrorMessage = translation;
            // });

            function translatedToast(type, settings, defaultSettings) {
                if (settings.translate) {
                    $translate(settings.translate)
                        .then(function(translation) {
                            settings.message = translation;
                            toast(type, settings, defaultError);
                        })
                        .catch(function(err) {
                            toast(type, settings, defaultError);
                        });
                } else {
                    toast(type, settings, defaultError);
                }
            }
            
            function toast(type, settings, defaultSettings) {
                settings = settings || {};
                var mergedSettings = angular.merge({}, defaultSettings, settings);

                // add feedback button ?
                if (mergedSettings.feedback) {
                    mergedSettings.message += '<div class="text-center"><a href="" class="gb-button--primary">Leave feedback</a></div>';
                }

                toastr[type](mergedSettings.message, mergedSettings.title,
                    {
                        allowHtml: true,
                        onShown: function(toast) {
                            angular.element( toast.el[0]).find('a')[0].onclick = showFeedback;
                        }
                        // onTap:function(){
                        //    //alert("You Clicked Toastr!!")
                        // }
                    });
            }

            this.error = function(settings) {
                translatedToast('error', settings, defaultError);
            };

            this.partialFailure = function(settings) {
                translatedToast('error', settings, defaultPartialFailure);
            };

            this.warning = function(settings) {
                translatedToast('warning', settings, defaultWarning);
            };

            this.partialResult = function(settings) {
                translatedToast('warning', settings, defaultPartialResult);
            };

            this.info = function(settings) {
                translatedToast('info', settings, defaultInfo);
            };

            function showFeedback(event) {
                $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {state: false});
                $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true});
                $rootScope.$broadcast(NAV_EVENTS.toggleNotifications, {toggle: false});
                event.preventDefault();
                return false;
            }


            return {
                error: this.error,
                partialFailure: this.partialFailure,
                warning: this.warning,
                partialResult: this.partialResult,
                info: this.info
            };
        });
})();

