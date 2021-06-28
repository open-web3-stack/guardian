#!/usr/bin/env node

import run from '../auction';

run().catch((error) => {
  console.error(error);
  process.exit(-1);
});
