#!/usr/bin/env node

import run from '../cdp';

run().catch((error) => {
  console.error(error);
  process.exit(-1);
});
