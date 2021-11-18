import { of } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { ApiRx } from '@polkadot/api';
import { Option } from '@polkadot/types/codec';
import { TimestampedValueOf } from '@open-web3/orml-types/interfaces';
import { CurrencyId } from '@laminar/types/interfaces';

const getOraclePrice = (apiRx: ApiRx) => (tokenId: CurrencyId) => {
  if (tokenId.toString() === 'AUSD') return of(1e18);
  return apiRx.query.laminarOracle.values<Option<TimestampedValueOf>>(tokenId).pipe(
    filter((value) => value.isSome),
    map((value) => Number(value.unwrap().value.toString()))
  );
};

export default getOraclePrice;
