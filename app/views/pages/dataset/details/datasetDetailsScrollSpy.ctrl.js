'use strict';

var angular = require('angular');

angular
    .module('portal')
    .controller('scrollSpyCtrl', scrollSpyCtrl);

/** @ngInject */
function scrollSpyCtrl() {
    var EventUtil = {
        addHandler: function (element, type, handler) {
            if (element.addEventListener) {
                element.addEventListener(type, handler, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + type, handler);
            } else {
                element['on' + type] = handler;
            }
        }
    };

    var metadataStrip = document.getElementById('metadata'),
        metaNav = document.getElementById('metadata-nav'),
        metaContent = document.getElementById('metadata-content'),
        metaNavBottomSpacing = 200,
        offsetHeightMetaNavOccupied = 80 + metaNav.offsetHeight + metaNavBottomSpacing,
        offsetHeightMetadataStrip = metadataStrip.offsetHeight,
        offsetTopMetadataStripHighest = offsetHeightMetadataStrip - offsetHeightMetaNavOccupied,
        rectMetadataStrip,
        rectMetaNav;

    EventUtil.addHandler(window, 'scroll', function () {
        if (document.compatMode == 'CSS1Compat') {
            rectMetadataStrip = metadataStrip.getBoundingClientRect();
            rectMetaNav = metaNav.getBoundingClientRect();

            if (rectMetadataStrip.top < 70 && rectMetadataStrip.top > -offsetTopMetadataStripHighest) {
                metaNav.style.position = 'fixed';
                metaNav.style.top = '80px';
            } else if (rectMetadataStrip.top < -offsetTopMetadataStripHighest) {
                metaNav.style.position = 'absolute';
                metaNav.style.top = '';
                metaNav.style.bottom = (metaNavBottomSpacing) + 'px';
            } else {
                metaNav.style.position = '';
                metaNav.style.top = '';
                metaNav.style.bottom = '';
            }

            if (rectMetadataStrip.top < 70) {
                metaContent.classList.add('col-md-offset-4');
            } else {
                metaContent.classList.remove('col-md-offset-4');
            }

            // For debugging the positioning of the nav
            // console.log(rectMetadataStrip.top + ', ' + rectMetadataStrip.bottom + ', ' + offsetHeightMetaNavOccupied + ', ' + offsetTopMetadataStrip + ', ' + offsetTopMetadataStripHighest);
        }
    });
}

module.exports = scrollSpyCtrl;