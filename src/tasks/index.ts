import _ from 'lodash';
import { TaskInterface, NetworkType } from '../types';

import ethereum from './ethereum';
import laminarChain from './laminarChain';

const tasks = {
  ethereum,
  laminarChain,
};

export const getTask = (network: NetworkType, name: string): TaskInterface => {
  const key = `${network}.${name}`;
  const task = _.get(tasks, key, null);
  if (!task) {
    throw Error(`${network}:${name} not found`);
  }
  return task;
};

export default tasks;
