import { Loan } from '@open-web3/guardian/types';
import { setupApi } from './setupApi';
import registerAction from '../registerAction';
import { pausable } from '../pausable';

const run = async () => {
  const { adjustLoan } = await setupApi();

  const unsafeLoan$ = registerAction<Loan>('unsafeLoan');

  const { stream$, pause, resume } = pausable(unsafeLoan$);

  stream$.subscribe(({ data: loan }) => {
    pause(); // pause stream$ so we don't make double adjusments
    adjustLoan(loan)
      .then(() => {
        resume();
      })
      .catch((e) => console.error(e));
  });

  // start guardian
  require('@open-web3/guardian-cli');
};

export default run;

// if called directly
if (require.main === module) {
  run().catch((error) => {
    console.error(error);
    process.exit(-1);
  });
}
