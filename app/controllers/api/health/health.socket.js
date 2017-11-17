"use strict";

/**
 * A socket for updating the client about the state of the required services
 */

var express = require('express'),
    getStatus = require('./notifications.model');

module.exports = function (io) {

    setInterval(function () {
        let status = getStatus();
        if (status.changed) {
            io.emit('statusNotification', status);
        }
    }, 5000);

    io.on('connection', function (socket) {
        //a user has connected
        let status = getStatus();
        console.log('a user connected');
        io.emit('statusNotification', status);
    });
};

/*
notifications
*/