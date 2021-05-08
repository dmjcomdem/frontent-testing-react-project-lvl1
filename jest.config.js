module.exports = {
  clearMocks: true,
  transform: {
    '^.+\\.(js)$': '<rootDir>/node_modules/babel-jest',
  },
  testEnvironment: 'node',
};
