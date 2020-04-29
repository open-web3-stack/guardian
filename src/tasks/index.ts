import _ from 'lodash';
import { TaskInterface, NetworkType } from '../types';

import ethereum from './ethereum';
import laminarChain from './laminarChain';

const tasks = {
  ethereum,
  laminarChain,
};

export const getTask = (network: NetworkType, name: string): TaskInterface | null => {
  const key = `${network}.${name}`;
  return _.get(tasks, key, null);
};

export default tasks;
