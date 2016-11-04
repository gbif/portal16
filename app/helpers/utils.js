
function isGuid(stringToTest) {
    var regexGuid = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/gi;
    return regexGuid.test(stringToTest);
}

function renderPage(req, res, next, template, data) {
    try {
        if (req.params.ext == 'debug') {
            res.json(dataset);
        } else {
            res.render(template, data);
        }
    } catch (e) {
        next(e);
    }
}

module.exports = {
    isGuid: isGuid,
    renderPage: renderPage
};
