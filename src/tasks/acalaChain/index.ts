import { ApiRx } from '@polkadot/api';
import { Observable } from 'rxjs';

import createAcalaApi from './createAcalaApi';
import substrate from '../substrate';

export { createAcalaApi };

export default (api$: Observable<ApiRx>) => ({
  ...substrate(api$),
});
