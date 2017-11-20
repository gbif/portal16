"use strict";

/**
 * A socket for updating the client about the state of the required services
 */

var express = require('express'),
    getStatus = require('./notifications.model'),
    prevHash;

module.exports = function (io) {

    setInterval(function () {
        let status = getStatus();
        if (prevHash != status.hash) {
            io.emit('statusNotification', status);
            prevHash = status.hash;
        }
    }, 5000);

    io.on('connection', function (socket) {
        let status = getStatus();
        io.emit('statusNotification', status);
    });
};
