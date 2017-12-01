'use strict';

var angular = require('angular'),
    socket_io = require('socket.io-client');

angular
    .module('portal')
    .factory('socket', function ($rootScope) {
        //var socket = socket_io();
        //return socket;
        var socket = socket_io();
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            }
        };
    });