#!/usr/bin/env node

import run from '../dex-price';

run().catch((error) => {
  console.error(error);
  process.exit(-1);
});
