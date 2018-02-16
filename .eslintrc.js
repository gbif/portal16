let config = {
    'extends': [
        'eslint:recommended'
        // 'google'
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
        'no-console': 1,
        'require-jsdoc': 0,
        'max-len': [2, { "code": 200 }],
        'new-cap': 0
    }
};

module.exports = config;