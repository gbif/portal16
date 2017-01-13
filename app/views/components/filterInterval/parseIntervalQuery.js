module.exports = function (str) {
    str = str || '';
    if (str.toString() == '') return;

    var parts = str.toString().split(',');
    if (parts.length == 1 && isFinite(parts[0])) {
        //is
        return {
            values: [parts[0]],
            type: 'is'
        };
    } else if (parts.length == 2) {
        if (isFinite(parts[0]) && isFinite(parts[1])) {
            return {
                values: parts,
                type: 'between'
            };
        } else if (parts[0] === '*' && isFinite(parts[1])) {
            return {
                values: [undefined, parts[1]],
                type: 'lessThan'
            };
        } else if (isFinite(parts[0]) && parts[1] === '*') {
            return {
                values: [parts[0], undefined],
                type: 'largerThan'
            };
        }
    }
};