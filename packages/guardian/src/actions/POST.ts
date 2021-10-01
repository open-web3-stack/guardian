import axios from 'axios';
import { Action } from '../types';

const POST: Action = (data: any, metadata: any) => {
  const { url, headers } = metadata.action as { url: string; headers?: any };
  axios.request({ method: 'POST', url, data: { data, metadata }, headers });
};

export default POST;
