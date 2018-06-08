'use strict';

let helper = rootRequire('app/models/util/util'),
    resource = rootRequire('app/controllers/resource/key/resourceKey');

module.exports = {
    eoiPage: eoiPage
};

/**
 * Render create page
 */
function eoiPage(req, res, next) {
    let homepage = resource.getByAlias('/become-a-publisher', 2, false, res.locals.gb.locales.current);
    homepage.then(
        function(data) {
            helper.renderPage(req, res, next, {
                prose: data,
                _meta: {
                    title: req.__('eoi.eoiTitle'),
                    description: req.__('eoi.eoiDescription')
                }
            }, 'pages/custom/becomePublisher/becomePublisher');
        },
        function(err) {
            next(err);
        }
    );
}
