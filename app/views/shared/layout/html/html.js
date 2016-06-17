var angular = require('angular');
require('angular-ui-router');
require('angular-translate');
require('angular-moment');
require('angular-leaflet-directive');
require('angular-hotkeys');
require('angular-resource');
require('angular-aria');
require('angular-ui-bootstrap');
require('ng-infinite-scroll');
require('angular-scroll');
require('../../../components/clickoutside/clickoutside.directive');

(function () {
    'use strict';
    angular
        .module('portal', ['ngAria', 'ui.router', 'pascalprecht.translate', 'leaflet-directive', 'angularMoment', 'cfp.hotkeys', 'ngResource', 'ui.bootstrap', 'infinite-scroll', 'gb-click-outside', 'duScroll']);
})();

(function () {
    'use strict';
    angular
        .module('portal')
        .run(runBlock);

    /** @ngInject */
    function runBlock(amMoment) { //$log
        //$log.debug('runBlock end');
        amMoment.changeLocale('en');
    }
})();

require('./angular/env.constants');
require('./angular/routerConfig');
require('./angular/translate');
require('./angular/occurrence.resource');
require('./angular/dataset.resource');
require('./angular/species.resource');
require('./angular/map.resource');
require('./angular/similarOccurrence.service');
require('./angular/occurrenceFilter.service');
require('./angular/map.constants');

require('../../../pages/search/search.ctrl');
require('../../../pages/occurrence/key/occurrenceKey.ctrl');
require('../../../pages/occurrence/occurrence.ctrl');
require('../../../pages/occurrence/table/occurrenceTable.ctrl');
require('../../../pages/occurrence/map/occurrenceMap.ctrl');
require('../../../pages/occurrence/gallery/occurrenceGallery.ctrl');

require('../../../pages/dataset/search/dataset.ctrl');

require('../../../pages/dataset/details/datasetDetailsDownloadEventsTable.ctrl');
require('../../../pages/dataset/details/datasetDetailsContactPopup.ctrl');
require('../../../pages/dataset/details/datasetDetailsScrollSpy.ctrl');

require('../../../components/map/basic/gbmap.directive');
require('../../../components/suggest/suggest.directive');
require('../../../components/expand/expand.directive');
require('../../../components/shorten/shorten.directive');
require('../../../components/fab/fab.directive');






var menu = require('../partials/navigation/navigation.js');


//https://cdnjs.cloudflare.com/ajax/libs/classlist/2014.01.31/classList.min.js
/*! modernizr 3.3.1 (Custom Build) | MIT *
 * http://modernizr.com/download/?-classlist-setclasses !*/
//!function(n,e,s){function o(n,e){return typeof n===e}function a(){var n,e,s,a,i,f,r;for(var c in l)if(l.hasOwnProperty(c)){if(n=[],e=l[c],e.name&&(n.push(e.name.toLowerCase()),e.options&&e.options.aliases&&e.options.aliases.length))for(s=0;s<e.options.aliases.length;s++)n.push(e.options.aliases[s].toLowerCase());for(a=o(e.fn,"function")?e.fn():e.fn,i=0;i<n.length;i++)f=n[i],r=f.split("."),1===r.length?Modernizr[r[0]]=a:(!Modernizr[r[0]]||Modernizr[r[0]]instanceof Boolean||(Modernizr[r[0]]=new Boolean(Modernizr[r[0]])),Modernizr[r[0]][r[1]]=a),t.push((a?"":"no-")+r.join("-"))}}function i(n){var e=r.className,s=Modernizr._config.classPrefix||"";if(c&&(e=e.baseVal),Modernizr._config.enableJSClass){var o=new RegExp("(^|\\s)"+s+"no-js(\\s|$)");e=e.replace(o,"$1"+s+"js$2")}Modernizr._config.enableClasses&&(e+=" "+s+n.join(" "+s),c?r.className.baseVal=e:r.className=e)}var t=[],l=[],f={_version:"3.3.1",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(n,e){var s=this;setTimeout(function(){e(s[n])},0)},addTest:function(n,e,s){l.push({name:n,fn:e,options:s})},addAsyncTest:function(n){l.push({name:null,fn:n})}},Modernizr=function(){};Modernizr.prototype=f,Modernizr=new Modernizr;var r=e.documentElement;Modernizr.addTest("classlist","classList"in r);var c="svg"===r.nodeName.toLowerCase();a(),i(t),delete f.addTest,delete f.addAsyncTest;for(var u=0;u<Modernizr._q.length;u++)Modernizr._q[u]();n.Modernizr=Modernizr}(window,document);
//
//if (Modernizr.classlist) {
//    alert(Modernizr.classlist);
//} else {
//    alert(Modernizr.classlist);
//}
(function() {
    function appendScript(conditionalScript) {
        var el = document.createElement('script');
        el.setAttribute('src', conditionalScript);
        document.head.appendChild(el);
    }

    //We wan't classlist and this is not supported in ie9
    if (!document.body.classList) {
        appendScript('//cdnjs.cloudflare.com/ajax/libs/classlist/2014.01.31/classList.min.js');
    }
})();



//Matches there are vendor prefixes and no suport in ie9
this.Element && function(ElementPrototype) {
    ElementPrototype.matchesSelector = ElementPrototype.matchesSelector ||
    ElementPrototype.mozMatchesSelector ||
    ElementPrototype.msMatchesSelector ||
    ElementPrototype.oMatchesSelector ||
    ElementPrototype.webkitMatchesSelector ||
    function (selector) {
        var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
        while (nodes[++i] && nodes[i] != node);
        return !!nodes[i];
    }
}(Element.prototype);



/**
 This method should catch all, but the line number and column might not be supported in all browsers. Test this

 https://danlimerick.wordpress.com/2014/01/18/how-to-catch-javascript-errors-with-window-onerror-even-on-chrome-and-firefox/
 For files loaded across CDN use the crossorigin attribute for logging to work
 <script crossorigin="anonymous" src="//cdn/vendorfile.js"></script>
 The crossorigin tag has two possible values.

 There might be issues in iOS Safari and older Androids.
 These can be filtereed by checking if the error message is equal to “Script error.”.
 window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
    if (errorMsg.indexOf('Script error.') > -1) {
        return;
    }
}
 */

function stackTrace() {
    var err = new Error();
    return err.stack;
}

window.onerror = function(msg, file, line, col, error) {
    var errorData = {
        msg: msg,
        file: file,
        line: line,
        col: col,
        error: error,
        stack: stackTrace()
    };
    var request = new XMLHttpRequest();
    request.open('POST', '/api/log/error', true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(errorData));

    //$.post('/api/log/error', errorData);
    return false; //still write error to console
};

// console.log('test');
// window.mytest = $('.navbar');
// menu.tester();
//throw new Error();

function increaseNumber(num) {
    return num + menu.myvar;
}

module.exports = {
    increaseNumber: increaseNumber
};


//Create a global GBIF Object
(function (global) {
    var gb = global.gb || {},
        util = {VERSION: '0.0.1'};


    //event listeners
    util.addEventListenerAll = function (selector, eventName, handler) {
        util.forEachElement(selector, function (el) {
            el.addEventListener(eventName, handler);
        })
    };

    //misc
    util.forEachElement = function (selector, fn) {
        var elements = document.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++)
            fn(elements[i], i);
    };

    //consider moving into polyfill
    util.matches = function (el, selector) {
        var p = Element.prototype;
        var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
                return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
            };
        return f.call(el, selector);
    };


    gb.util = util;
    global.gb = gb;
})(window);


var searchToggleSelector = '.site-header__search-toggle',
    navToggleSelector = '.site-header__menu-toggle';
var toggleMenu = function () {
    document.getElementById('site-header').classList.toggle('is-active');
    document.getElementById('site-canvas').classList.toggle('hasActiveMenu');

    gb.util.forEachElement(searchToggleSelector, function (el) {
        el.classList.remove('is-active');
    });

    var searchAreaEl = document.getElementById('site-search');
    searchAreaEl.classList.remove('is-active');
};
gb.util.addEventListenerAll(navToggleSelector, 'click', toggleMenu);


function getAncestors(el, stopEl) {
    var ancestors = [];
    while ((el = el.parentElement) && el != stopEl) ancestors.push(el);
    return ancestors;
}

//collapse and expand menu items
var siteNav = document.getElementById('nav');
var SiteNavCategoryItems = siteNav.querySelectorAll('.is-category');
gb.util.addEventListenerAll('.is-category>a', 'click', function (event) {
    var ancestors = getAncestors(this, siteNav),
        child, i;

    //collpase all items that are not parents
    for (i = 0; i < SiteNavCategoryItems.length; i++) {
        child = SiteNavCategoryItems[i];
        if (ancestors.indexOf(child) == -1) {
            child.classList.remove('is-expanded');
        }
    }

    if (!siteNav.classList.contains('is-expanded')) {
        //for horizontal layout. When changing from laptop to mobile this means that the first menu click is ignored
        this.parentNode.classList.add('is-expanded');
    }
    else {
        this.parentNode.classList.toggle('is-expanded');
    }
    siteNav.classList.add('is-expanded');//use for horizontal layout
    event.preventDefault(); //do not scroll to top
});

//collapse expand service menu
gb.util.addEventListenerAll('.service-menu__teaser>a', 'click', function () {
    this.parentNode.parentNode.classList.toggle('is-expanded');
});


//Search toggling
gb.util.addEventListenerAll(searchToggleSelector, 'click', function (event) {
    gb.util.forEachElement(searchToggleSelector, function (el) {
        el.classList.toggle('is-active');
    });

    var searchAreaEl = document.getElementById('site-search');
    searchAreaEl.classList.toggle('is-active');
    searchAreaEl.querySelector('input').focus();
    closeMenus();
    event.preventDefault();
});





//close menu when clicking outside
function closeMenus() {
    siteNav.classList.remove('is-expanded');
    if (document.getElementById('site-canvas').classList.contains('hasActiveMenu')) {
        toggleMenu();
    }
}
function closeMenusOnClickOutside(event) {
    var clickOnContent = gb.util.matches(event.target, '#main *');
    if (clickOnContent) {
        closeMenus();
    }
}
document.addEventListener('click', closeMenusOnClickOutside);
document.addEventListener('touchend', closeMenusOnClickOutside);

