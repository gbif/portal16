let severity = Object.freeze({
        OPERATIONAL: 'OPERATIONAL',
        WARNING: 'WARNING',
        CRITICAL: 'CRITICAL'
    }),
    severityMap = Object.freeze({
        OPERATIONAL: 0,
        INFO: 1,
        WARNING: 2,
        CRITICAL: 3
    });

function getMostSevere(a, b){
    let typeA = severityMap[a] || 0,
        typeB = severityMap[b] || 0;
    return typeA < typeB ? b : a;
}

module.exports = {severity, severityMap, getMostSevere};