"use strict";

/**
 * A socket for updating the client about the state of the required services
 */

var express = require('express'),
    tests = require('./tests'),
    health = require('./health.model');

module.exports = function (io) {
    io.on('connection', function (socket) {

        //a user has connected
        console.log('a user connected');
        io.emit('statusNotification', {status: currentState});



        setTimeout(function () {
            updateState(io);
        }, 2000);

        //push an update to the user
        //setTimeout(function(){
        //    io.emit('statusNotification', {status: currentState});
        //}, 2000);

        //run tests every 20 seconds
        //setTimeout(function () {
        //    updateState(function (changed) {
        //        if (changed) {
        //            io.emit('statusNotification', {status: currentState});
        //        }
        //    })
        //}, 2000);

        //updateState(function (changed) {
        //    if (changed) {
        //        io.emit('statusNotification', {status: currentState});
        //    }
        //});

        //function done(summary) {
        //    console.log('done');
        //    console.log(summary);
        //    io.emit('statusNotification', {status: summary});
        //}
        //function progress(summary) {
        //    console.log('progress');
        //    io.emit('statusNotification', {status: summary});
        //}
        //function failed(summary) {
        //    console.log('failed');
        //    io.emit('statusNotification', {failure: summary});
        //}
        //health.start(tests, done, progress, failed);
        //setTimeout(function () {
        //    health.start(tests, done, progress, failed);
        //}, 1000);

    });
};

let currentState;

function updateState(io) {

    function done(summary) {
        console.log('done');
        console.log(summary);
        io.emit('statusNotification', {status: summary});
    }
    function progress(summary) {
        console.log('progress');
        io.emit('statusNotification', {status: summary});
    }
    function failed(summary) {
        console.log('failed');
        io.emit('statusNotification', {failure: summary});
    }
    health.start(tests, done, progress, failed);
    setTimeout(function () {
        health.start(tests, done, progress, failed);
    }, 1000);

    //function done(summary) {
    //    currentState = summary;
    //    let changed = _.get(currentState, 'status') != summary.status;
    //    cb(null, changed);
    //}
    //function progress(summary) {
    //    //cb(null, summary);
    //}
    //function failed(err) {
    //    cb(err);
    //}
    //health.start(tests, done, progress, failed);

    //return new Promise((resolve, reject) => {
    //    health.start(tests,
    //        function (summary) {
    //        console.log('done in socket');
    //            currentState = summary;
    //            let changed = _.get(currentState, 'status') != summary.status;
    //            resolve(changed);
    //        },
    //        function () {
    //            //ignore progress updates
    //        },
    //        function (err) {
    //            //getting status failed
    //            console.log(err);//TODO how to handle fatal erros like thios better
    //            currentState = undefined;
    //            reject(err);
    //        });
    //});

}