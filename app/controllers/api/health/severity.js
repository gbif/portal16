let severity = Object.freeze({
        OPERATIONAL: 'OPERATIONAL',
        WARNING: 'WARNING',
        CRITICAL: 'CRITICAL'
    }),
    severityMap = Object.freeze({
        OPERATIONAL: 0,
        WARNING: 1,
        CRITICAL: 2
    });

module.exports = {severity, severityMap};