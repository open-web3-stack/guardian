import axios from 'axios';
import { IActionRunner } from '../types';

type Args = { url: string; headers?: any };

export default class POSTRunner implements IActionRunner<Args> {
  method = 'POST';

  run(args: Args, data: any) {
    const { url, headers } = args;
    axios.request({ method: 'POST', url, data, headers });
  }
}
