import axios from 'axios';
import { Action } from '../types';

type Args = { url: string; headers?: any };

const POST: Action<Args> = (args: Args, data: any) => {
  const { url, headers } = args;
  axios.request({ method: 'POST', url, data, headers });
};

export default POST;
