var menu = require('../partials/navigation/navigation.js');
$ = require('jquery');
// var test = 5;
// var test2 = 9;


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

// console.log('test');
// window.mytest = $('.navbar');
// menu.tester();

function increaseNumber(num) {
    return num + menu.myvar;
}

module.exports = {
    increaseNumber: increaseNumber
};