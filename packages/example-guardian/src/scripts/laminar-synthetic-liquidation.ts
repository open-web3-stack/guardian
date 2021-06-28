#!/usr/bin/env node

import run from '../laminar-synthetic-liquidation';

run().catch((error) => {
  console.error(error);
  process.exit(-1);
});
