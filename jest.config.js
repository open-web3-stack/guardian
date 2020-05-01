module.exports = {
  preset: 'ts-jest',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
  modulePathIgnorePatterns: ['__mocks__'],
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};
