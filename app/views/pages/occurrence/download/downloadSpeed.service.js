
angular
    .module('portal')
    .factory('DownloadSpeed', function($translate) {
        return {
        calculate: function(filesize) {
          var bandwidth = 50000000;
          var filetime = (filesize * 8) / bandwidth;
          var roundedHours = Math.round(filetime / 3600 );
          return Math.max(1, roundedHours);
        }

        };
    });


