import _ from "lodash";
import joi from "@hapi/joi";
import { Observable, from } from "rxjs";
import { flatMap, map } from "rxjs/operators";
import { MarginPoolInfo } from "@laminar/api";
import { laminarApi$ } from "../laminarApi";
import Task from "../Task";

export default class PoolInfoTask extends Task {
  validationSchema = joi
    .object({
      poolId: joi.alt(
        joi.number(),
        joi.array().items(joi.number()),
        joi.valid("all")
      ),
    })
    .required();

  call(params: {
    poolId: number | number[] | "all";
  }): Observable<MarginPoolInfo> {
    const { poolId } = this.validateParameters(params);

    return laminarApi$.pipe(
      flatMap((laminarApi) => {
        if (poolId === "all") {
          // get all pool ids then map into pool info
          return laminarApi.margin.allPoolIds().pipe(
            flatMap((ids) => ids.map((id) => laminarApi.margin.poolInfo(id))),
            flatMap((i) => i)
          );
        } else if (_.isArray(poolId)) {
          return from(poolId).pipe(
            map((id) => `${id}`),
            flatMap((id) => laminarApi.margin.poolInfo(id))
          );
        }
        return laminarApi.margin.poolInfo(`${poolId}`);
      })
    );
  }
}
