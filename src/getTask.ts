import _ from "lodash";
import { NetworkType, TaskInterface } from "./types";
import laminarTasks from "./laminar-chain/tasks";
import ethereumTasks from "./ethereum/tasks";

export default (network: NetworkType, name: string): TaskInterface | null => {
  switch (network) {
    case "laminarChain":
      return _.get(laminarTasks, name, null);
    case "ethereum":
      return _.get(ethereumTasks, name, null);
    default:
      return null;
  }
};
