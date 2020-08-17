#!/usr/bin/env node

const run = () => {
  // start guardian
  require('@open-web3/guardian-cli');
};

export default run;

// if called directly
if (require.main === module) {
  run();
}
