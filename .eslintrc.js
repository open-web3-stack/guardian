const base = require('@polkadot/dev/config/eslint');

module.exports = {
  ...base,
  parserOptions: {
    ...base.parserOptions,
    project: ['./tsconfig.json'],
  },
  rules: {
    ...base.rules,
    '@typescript-eslint/indent': 'off', // prettier
    'space-before-function-paren': 'off', // prettier
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-useless-constructor': 'off',
    'no-unused-expressions': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    'comma-dangle': 'off',
    'dot-notation': 'off',
    'no-useless-call': 'off',
    '@typescript-eslint/parser': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
};
