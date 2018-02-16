
angular
    .module('portal')
    .factory('DownloadSpeed', function() {
        return {
           calculate: function(filesize) {
          let  bandwidth = [2000000, 10000000, 100000000];


            let result = {};

            for (let x = 0; x < bandwidth.length; x++) {
                let filetime = (filesize*8) / bandwidth[x];

                let hourmod = filetime % 3600;
                let hour = Math.floor(filetime / 3600);
                let minute = Math.floor(hourmod / 60);
                if (hour <= 9) {
                    hour = '0' + hour;
                }

                if (minute <= 9 && hour !== '00') {
                    minute = '0' + minute;
                }

                let minuteTxt = (minute === 1 )? ' minute' : ' minutes';

                let time = (hour !== '00') ? (hour + ':' + minute +' hours') : (minute + minuteTxt);

                result[bandwidth[x]/1000000] = time;
            }

            return result;
        },

        };


    });


