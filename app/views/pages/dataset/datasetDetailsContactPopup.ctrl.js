'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('contactPopupCtrl', contactPopupCtrl);

/** @ngInject */
function contactPopupCtrl($sce) {
    var vm = this,
    headerContacts = JSON.parse(headerContactsString); // Passed through the template.
    vm.htmlPopover = [];
    headerContacts.forEach(function(r, ri){
        var role = [];
        r.contacts.forEach(function(c, ci){
            var html = '';
            html += '<address><strong>' + c.position + '</strong>';
            html += (c.address) ? '<br>' + c.address : '';
            html += (c.city) ? '<br>' + c.city : '';
            html += (c.province) ? ' ' + c.province : '';
            html += (c.country) ? '<br>' + c.country : '';
            html += (c.phone) ? '<br><abbr title="phone">Tel: </abbr>' + c.phone : '';
            html += (c.email) ? '<br><abbr title="email">Email: </abbr>' + c.email : '';
            html += '</address>';
            role[ci] = $sce.trustAsHtml(html);
        });
        vm.htmlPopover[ri] = role;
    });
}

module.exports = contactPopupCtrl;