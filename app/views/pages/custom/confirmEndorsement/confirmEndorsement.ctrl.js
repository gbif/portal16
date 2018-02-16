'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('confirmEndorsementCtrl', confirmEndorsementCtrl);

/** @ngInject */
function confirmEndorsementCtrl($cookies) {
    //TODO is this inteded for usage?
}

module.exports = confirmEndorsementCtrl;

