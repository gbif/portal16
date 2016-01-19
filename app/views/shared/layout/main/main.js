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

window.onerror = function(msg, file, line, col, error) {
    $.post('/api/log/error', {
        msg: msg,
        file: file,
        line: line,
        col: col,
        error: error,
        stack: stackTrace()
    });
    return false; //still write error to console
};

var fail = 5*'sdf'
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

    gb.forEachElement = function(selector, fn) {
        var elements = document.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++)
            fn(elements[i], i);
    };


    //Expose the gbif helper object globally
    if (global.gb) {
        throw new Error('gb has already been defined');
    } else {
        global.gb = gb;
    }
})(window);

gb.forEachElement('.site_navbar-toggleMenu', function(e, i){
    gb.addEventListener(e, 'click', function(){
        alert('hej fra gb lib')
    });
});