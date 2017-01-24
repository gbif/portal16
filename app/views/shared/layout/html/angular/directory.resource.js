'use strict';

var angular = require('angular');

(function () {
    'use strict';

    angular
        .module('portal')
        .factory('DirectoryContacts', function ($resource) {
            return $resource('/api/directory/contacts', null, {
                'get': {
                    method: 'GET',
                    isArray: false
                }
            });
        })
        // Accepts gbifRegion as param
        // return counts of each type of participants
        .factory('DirectoryParticipantsCount', function ($resource) {
            return $resource('/api/directory/participants/count',
                {gbifRegion: 'GLOBAL'},
                {
                    'get': {
                        method: 'GET',
                        params: {gbifRegion: '@gbifRegion'},
                        isArray: false
                    }
                })
                ;
        })
        // Accepts gbifRegion and membershipType as params
        // return participant objects
        .factory('DirectoryParticipants', function ($resource) {
            return $resource('/api/directory/participants',
                {gbifRegion: 'GLOBAL'},
                {
                    'get': {
                        method: 'GET',
                        params: {
                            gbifRegion: '@gbifRegion',
                            membershipType: '@membershipType'
                        },
                        isArray: true
                    }
                })
                ;
        })
        .factory('ParticipantHeads', function ($resource) {
            return $resource('/api/participant/heads/:participantId', null,
                {
                    'get': {
                        method: 'GET',
                        params: {
                            participantId: '@participantId'
                        },
                        isArray: false
                    }
                })
                ;
        })
        ;

})();

