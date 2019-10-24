module.exports = {
  collectCoverageFrom: [
    'packages/*/src/**/*.{js,ts}',
    'packages/*/index.js'
  ],
  testPathIgnorePatterns: [
    '/examples/'
  ]
};
