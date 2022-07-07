import { of } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { ApiRx } from '@polkadot/api';
import { Option } from '@polkadot/types/codec';
import { TimestampedValueOf } from '@open-web3/orml-types/interfaces';
import { CurrencyId } from '@acala-network/types/interfaces';

const getOraclePrice = (apiRx: ApiRx) => (tokenId: CurrencyId) => {
  const stableCoin = apiRx.consts.prices.getStableCurrencyId;
  if (tokenId.eq(stableCoin)) return of(Number(apiRx.consts.prices.stableCurrencyFixedPrice.toString()));
  return apiRx.query.acalaOracle.values<Option<TimestampedValueOf>>(tokenId).pipe(
    filter((value) => value.isSome),
    map((value) => Number(value.unwrap().value.toString()))
  );
};

export default getOraclePrice;
