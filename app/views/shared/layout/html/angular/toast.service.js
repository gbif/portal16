'use strict';

var angular = require('angular');

(function() {
    angular
        .module('portal')
        .service('toastService', function(toastr, $translate) {
            var readMoreTranslation = 'Read more';
            $translate('phrases.readMore')
                .then(function(translation) {
                    readMoreTranslation = translation;
                })
                .catch(function() {
                    // ignore error
                });

            // TODO errors needs translating
            var defaultError = {
                readMore: false,
                status: true,
                message: 'An error occurred. Please try again.'
            };

            var defaultPartialFailure = {
                readMore: false,
                status: true,
                message: 'Not all of the page could be shown. If the problem persists please let us know.'
            };

            var defaultWarning = {
                readMore: false,
                status: true,
                message: 'We are having issues showing this page.'
            };

            var defaultPartialResult = {
                readMore: false,
                status: true,
                message: 'You are seeing a partial result. This is likely due to busy servers'
            };

            var defaultInfo = {
                readMore: false,
                status: false
            };

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

                if (!mergedSettings.feedback && mergedSettings.readMore) {
                    mergedSettings.message += '<div class="text-center"><a href="' + mergedSettings.readMore + '" class="gb-button--primary">' + readMoreTranslation + '</a></div>';
                }

                toastr[type](mergedSettings.message, mergedSettings.title,
                    {
                        allowHtml: true
                    }
                );
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

            // function showFeedback(event) {
            //     $rootScope.$broadcast(NAV_EVENTS.toggleSearch, {state: false});
            //     $rootScope.$broadcast(NAV_EVENTS.toggleFeedback, {toggle: true});
            //     $rootScope.$broadcast(NAV_EVENTS.toggleNotifications, {toggle: false});
            //     event.preventDefault();
            //     return false;
            // }

            return {
                error: this.error,
                partialFailure: this.partialFailure,
                warning: this.warning,
                partialResult: this.partialResult,
                info: this.info
            };
        });
})();

