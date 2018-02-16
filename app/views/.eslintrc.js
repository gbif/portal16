let config = {
    extends: [
        'eslint:recommended',
        'google'
    ],
    plugins: [
        'angular'
    ],
    env: {
        'browser': true
    },
    parserOptions: {
        'ecmaVersion': 5
    },
    globals: {
        'window': true,
        'gb': true,
        'Chartist': true,
        'L': true,
        'angular': true,
        'noUiSlider': true,
        'ga': true,
        'Lightbox': true
    },
    rules: {
    }
};

module.exports = config;