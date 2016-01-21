var menu = require('../partials/navigation/navigation.js');
//$ = require('jquery');


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

//window.onerror = function(msg, file, line, col, error) {
//    $.post('/api/log/error', {
//        msg: msg,
//        file: file,
//        line: line,
//        col: col,
//        error: error,
//        stack: stackTrace()
//    });
//    return false; //still write error to console
//};

// console.log('test');
// window.mytest = $('.navbar');
// menu.tester();

function increaseNumber(num) {
    return num + menu.myvar;
}

module.exports = {
    increaseNumber: increaseNumber
};




//Create a global GBIF Object
(function(global) {
    var gb = {
        VERSION: '0.0.1'
    };

    gb.addEventListener = function(el, eventName, handler) {
        if (el.addEventListener) {
            el.addEventListener(eventName, handler);
        } else {
            el.attachEvent('on' + eventName, function(){
                handler.call(el);
            });
        }
    };

    gb.addEventListenerAll = function(selector, eventName, handler) {
        gb.forEachElement(selector, function(el){
            gb.addEventListener(el, eventName, handler);
        })
    };

    gb.forEachElement = function(selector, fn) {
        var elements = document.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++)
            fn(elements[i], i);
    };

    gb.toggleClass = function(el, className) {
        if (el.classList) {
            el.classList.toggle(className);
        } else {
            var classes = el.className.split(' ');
            var existingIndex = -1;
            for (var i = classes.length; i--;) {
                if (classes[i] === className)
                    existingIndex = i;
            }

            if (existingIndex >= 0)
                classes.splice(existingIndex, 1);
            else
                classes.push(className);

            el.className = classes.join(' ');
        }
    };

    gb.removeClass = function(el, className) {
        if (el.classList)
            el.classList.remove(className);
        else
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    };


    //Expose the gbif helper object globally
    if (global.gb) {
        throw new Error('gb has already been defined');
    } else {
        global.gb = gb;
    }
})(window);


var searchToggleSelector = '.site_navbar-search-toggle',
    navToggleSelector = '.navigation_toggle';

gb.addEventListenerAll(navToggleSelector, 'click', function(){
    gb.toggleClass(this, 'isActive');
    gb.toggleClass(document.getElementById('site_navbar-links'), 'isActive');

    //Close search
    gb.forEachElement(searchToggleSelector, function(el){
        gb.removeClass(el, 'isActive');
    });
    var searchAreaEl = document.getElementById('navbar_search_area');
    gb.removeClass(searchAreaEl, 'isActive');
});

gb.addEventListenerAll('.isCategory>a', 'click', function(){
    gb.toggleClass(this.parentElement, 'isExpanded');
});



gb.addEventListenerAll(searchToggleSelector, 'click', function(){
    gb.forEachElement(searchToggleSelector, function(el){
        gb.toggleClass(el, 'isActive');
    });

    var searchAreaEl = document.getElementById('navbar_search_area');
    gb.toggleClass(searchAreaEl, 'isActive');
    searchAreaEl.querySelector('input').focus();

    //close menu
    gb.forEachElement(navToggleSelector, function(el){
        gb.removeClass(el, 'isActive');
    });
    gb.removeClass(document.getElementById('site_navbar-links'), 'isActive');
});


