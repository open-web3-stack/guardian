import _ from "lodash";
import joi from "@hapi/joi";
import { Observable, from } from "rxjs";
import { flatMap, map } from "rxjs/operators";
import { laminarApi$ } from "../laminarApi";
import Task from "../Task";

export type Position = {
  account: string;
  poolId: any;
  positionId: any;
  isOpen: any;
};

export default class PositionsByTraderTask extends Task {
  validatationSchema = joi
    .object({
      account: joi.alt(joi.string(), joi.array().items(joi.string())),
    })
    .required();

  call(params: { account: string | string[] }): Observable<Position[]> {
    const { account } = this.validateParameters(params);

    return laminarApi$.pipe(
      flatMap((laminarApi) => {
        // map multiple accounts
        if (_.isArray(account)) {
          return from(account).pipe(
            flatMap((account: string) =>
              laminarApi.margin
                .positionsByTrader(account)
                .pipe(
                  map((positions) => positions.map((i) => ({ ...i, account })))
                )
            )
          );
        }
        // map single account
        return laminarApi.margin
          .positionsByTrader(account)
          .pipe(map((positions) => positions.map((i) => ({ ...i, account }))));
      })
    );
  }
}
