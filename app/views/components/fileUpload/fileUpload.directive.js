'use strict';
var angular = require('angular');

/**
 * Provides a 'onchange' event on input[file] (see https://github.com/angular/angular.js/issues/1375)
 *
 * ## Example
 * Usage <input type="file" name="myfile" fileUpload on-file-change="myUploadFileHandler">
 * myUploadFileHandler will be called with the following map object:
 *  - `event` : the change event object
 *  - `element` : element that triggered the event
 *  - `files`: FileList from the input field
 */
angular
    .module('portal')
    .directive('fileUpload', fileUploadDirective);

/** @ngInject */
function fileUploadDirective() {
    return {
        restrict: 'A',
        scope: {
            onFileChange: '='
        },
        link: function (scope, element) {
            element.on('change', function (event) {
                var params = {event: event, el: element, files: element[0].files};
                scope.$apply(function (scope) {
                    scope.onFileChange(params);
                });
            });
        }
    };
}

module.exports = fileUploadDirective;
