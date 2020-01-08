module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-underscore-dangle': [0],
    'import/no-extraneous-dependencies': [0],
    'global-require': [0],
    '@typescript-eslint/camelcase': [0],
    'import/no-unresolved': [0],
    'comma-dangle': [0],
    'no-restricted-syntax': [0],
    'no-await-in-loop': [0],
    'import/no-dynamic-require': [0],
    'no-shadow': [0],
  },
};
