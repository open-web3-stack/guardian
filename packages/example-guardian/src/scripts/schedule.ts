#!/usr/bin/env node

import run from '../schedule';

run().catch((error) => {
  console.error(error);
  process.exit(-1);
});
