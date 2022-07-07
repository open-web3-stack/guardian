module.exports = {
  moduleNameMapper: {
    '@open-web3/guardian(.*)$': '<rootDir>/packages/guardian/src/$1',
    '@open-web3/acala-guardian(.*)$': '<rootDir>/packages/acala-guardian/src/$1',
    '@open-web3/laminar-guardian(.*)$': '<rootDir>/packages/laminar-guardian/src/$1',
    '@open-web3/guardian-cli(.*)$': '<rootDir>/packages/guardian-cli/src/$1',
    '@open-web3/example-guardian(.*)$': '<rootDir>/packages/example-guardian/src/$1'
  },
  modulePathIgnorePatterns: [
    '__mocks__',
    '<rootDir>/build',
    '<rootDir>/packages/guardian/build',
    '<rootDir>/packages/acala-guardian/build',
    '<rootDir>/packages/laminar-guardian/build',
    '<rootDir>/packages/guardian-cli/build',
    '<rootDir>/packages/example-guardian/build'
  ],
  transformIgnorePatterns: ['/node_modules/(?!@polkadot|@acala-network|@laminar||@babel/runtime/helpers/esm/)']
};
