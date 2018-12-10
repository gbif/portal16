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
      'browser': true,
      'it': true,
      'describe': true,
      'beforeEach': true,
      'expect': true,
      'element': true,
      'by': true,
  },
  rules: {
      'comma-dangle': [2, 'never'],
      'no-console': 0, // temporary disabled untli they have been evaluated and perhaps replaced with log statements
      'require-jsdoc': 0,
      'max-len': [2, { "code": 200 }],
      'new-cap': 0,
      'no-invalid-this': 0,
      'no-var': 0,
      'one-var': 0,
      'valid-jsdoc': 0 //we should probably enable this, but while getting removing other linting errors it is nice to not add to it
  }
};

module.exports = config;