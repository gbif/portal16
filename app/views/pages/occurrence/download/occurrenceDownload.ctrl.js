/**
 * search types?
 * auto complete
 * integer is [between, below, above]
 * date interval etc
 * enum list, multiselect
 */
'use strict';
var angular = require('angular'),
    _ = require('lodash');

angular
    .module('portal')
    .controller('occurrenceDownloadCtrl', occurrenceDownloadCtrl);

/** @ngInject */
function occurrenceDownloadCtrl(OccurrenceFilter, Remarks, env, $httpParamSerializer) {
    var vm = this;
    vm.remarks = {};
    vm.state = OccurrenceFilter.getOccurrenceData();
    vm.hasFossils = false;
    vm.estKbDwcA = 0.165617009; //based on 111GB for 702777671 occurrences in “DWCA"
    vm.estKbCsv = 0.065414979; //based on 44GB for 705302432 occurrences in CSV

    vm.adhocTileApi = env.dataApiV2;//.replace('//', ''); //TODO this becomes an issue everywhere we use subdomains. If not http2 then this should be done differently

    var toCamelCase = function (str) {
        return str.replace(/_([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });
    };

    vm.getTile = function (tileKey) {
        tileKey = tileKey || '/0/0/0';
        return vm.adhocTileApi + 'map/occurrence/adhoc' + tileKey + '.png?srs=EPSG:4326&style=classic.poly&bin=hex&hexPerTile=17&' + toCamelCase($httpParamSerializer(vm.state.query));
    };

    vm.getMostRestrictiveLicense = function (licenseCounts) {
        if (_.get(licenseCounts, 'CC_BY_NC_4_0.count', 0) > 0) {
            return 'license.CC_BY_NC_4_0';
        } else if (_.get(licenseCounts, 'CC_BY_4_0.count', 0) > 0) {
            return 'license.CC_BY_4_0';
        }
        return 'license.CC0_1_0';
    };

    vm.showFossilWarning = function () {
        vm.hasFossils = _.get(vm.state, 'data.facets.BASIS_OF_RECORD.counts.FOSSIL_SPECIMEN.count', 0) > 0;
        return vm.hasFossils;
    };

    Remarks.then(function (response) {
        vm.remarks = {};
        response.data.remarks.map(function (remark) {
            vm.remarks[remark.type] = remark;
        });
    });

}

module.exports = occurrenceDownloadCtrl;
