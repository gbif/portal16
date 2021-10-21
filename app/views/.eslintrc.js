let config = {
    extends: [
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
        'no-trailing-spaces': 'off',
        'comma-dangle': [2, 'never'],
        'no-console': 0,
        'require-jsdoc': 0,
        'max-len': 'off',
        'new-cap': 0,
        'no-invalid-this': 0,
        'no-var': 0,
        'one-var': 0,
        'valid-jsdoc': 0 //we should probably enable this, but while getting removing other linting errors it is nice to not add to it
    }
};

module.exports = config;