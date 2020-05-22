import axios from 'axios';
import { IAction } from '../types';

type Args = { url: string; headers?: any };

export default class ActionPOST implements IAction<Args> {
  method = 'POST';

  run(args: Args, data: any) {
    const { url, headers } = args;
    axios.request({ method: 'POST', url, data, headers });
  }
}
