(function(){
    "use strict";
    function stackTrace() {
        var err = new Error();
        return err.stack;
    }

    window.onerror = function (msg, file, line, col, error) {
        //return;//TODO find better way that won't spam server in case of a looping error
        window.gb = window.gb || {};
        gb.lastErrorDateTime = gb.lastErrorDateTime || 0;
        var currentTime = new Date().getTime();

        if (currentTime - gb.lastErrorDateTime > 300000) {
            gb.lastErrorDateTime = currentTime;
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
        }

        return false; //still write error to console
    };
})();