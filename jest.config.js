module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/(*-test|test).ts'],
  globals: {
    'ts-jest': {
      packageJson: 'package.json'
    }
  }
};
