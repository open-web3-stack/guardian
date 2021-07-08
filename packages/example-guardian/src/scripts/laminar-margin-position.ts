#!/usr/bin/env node

import run from '../laminar-margin-position';

run().catch((error) => {
  console.error(error);
  process.exit(-1);
});
