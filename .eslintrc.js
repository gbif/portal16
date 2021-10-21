let config = {
    'extends': [
        'eslint:recommended',
        'google'
    ],
    'plugins': [],
    'env': {
        'node': true
    },
    'globals': {
        'module': true,
        'rootRequire': true,
        'Set': true,
        'Promise': true
    },
    'parserOptions': {
        'ecmaVersion': 8
    },
    rules: {
        'no-trailing-spaces': 'off',
        'comma-dangle': 0,
        'spaced-comment': 'off',
        'space-infix-ops': 1,
        'no-console': 0, // temporary disabled untli they have been evaluated and perhaps replaced with log statements
        'require-jsdoc': 0,
        'max-len': 'off',
        'new-cap': 0,
        'eol-last': 'off',
        'one-var': 0,
        'valid-jsdoc': 0, //we should probably enable this, but while getting removing other linting errors it is nice to not add to it
        'no-throw-literal': 0, // Disabled for now. We should go through all errors thrown at some point
        'space-before-function-paren': 0
    }
};

module.exports = config;
