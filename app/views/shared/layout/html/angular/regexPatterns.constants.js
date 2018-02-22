/* eslint-disable no-useless-escape */
/* Angular and eslint seem to disagree on what counts as redundant escapes */
'use strict';
var angular = require('angular');

angular
    .module('portal')
    .constant('regexPatterns', {
        userName: '^[a-z0-9_.-]{3,64}$',
        email: '^[_A-Za-z0-9-\+]+(\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\.[A-Za-z0-9]+)*(\.[A-Za-z]{2,})$'
    });
