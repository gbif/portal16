module.exports = function (str) {
    str = str || '';
    if (str.toString() == '') return;

    var parts = str.toString().split(',');
    if (parts.length == 1) {
        //is
        return {
            values: [parts[0]],
            type: 'is'
        };
    } else if (parts.length == 2) {
        if (parts[0] !== '*' && parts[1] !== '*') {
            return {
                values: parts,
                type: 'between'
            };
        } else if (parts[0] === '*' && parts[1] !== '*') {
            return {
                values: [undefined, parts[1]],
                type: 'lessThan'
            };
        } else if (parts[0] !== '*' && parts[1] === '*') {
            return {
                values: [parts[0], undefined],
                type: 'largerThan'
            };
        }
    }
};