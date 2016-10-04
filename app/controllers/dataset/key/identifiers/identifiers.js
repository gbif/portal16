/**
 * ported as is from BKO version - refactored only for better overview of code
 * To process identifiers so the template only get those meaningful to show.
 * There are multiple identifiers coming together in the API response. We want to show only
 * 1) DOI that resolves to the original dataset page;
 * 2) URLs that are provided by the data publisher;
 * 3) UUID that are provided by the data publisher and are NOT resolving to GBIF dataset page;
 * 4) Other identifiers that are provided by the data publisher.
 *
 * TODO As of 8 May 16 We print out all ids except 'GBIF_PORTAL', despite the goal above.
 * @param identifiers
 */
function processIdentifiers(identifiers) {
    var processedIdentifiers = [];
    var typeToDisplay = ['DOI', 'URL', 'UUID', 'LSID', 'FTP', 'UNKNOWN'];
    identifiers = identifiers.sort(function (a, b) {
        return typeToDisplay.indexOf(a.type) - typeToDisplay.indexOf(b.type);
    });
    identifiers.forEach(function (id) {
        if (typeToDisplay.indexOf(id.type) != -1) {
            var idObj = {};
            idObj.formattedString = id.type + ' ' + setAnchor(id.identifier);
            processedIdentifiers.push(idObj);
        }

        function setAnchor(str) {
            if (str.match('^(http|https|ftp)://')) {
                return '<a href="' + str + '">' + str + '</a>';
            }
            else {
                return str;
            }
        }
    });
    return processedIdentifiers;
}

module.exports = processIdentifiers;
