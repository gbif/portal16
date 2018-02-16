'use strict';

let angular = require('angular');

angular
    .module('portal')
    .controller('countryParticipantCtrl', countryParticipantCtrl);

/** @ngInject */
function countryParticipantCtrl() {
    let vm = this;
    vm.nodeKey = gb.nodeKey;
    // vm.setData = function() {
    //    console.log(2349087);
    //    vm.nodeKey = gb.nodeKey;
    // };
    // console.log(123);
}

module.exports = countryParticipantCtrl;
