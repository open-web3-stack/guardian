import { exec } from 'shelljs';
import { Action } from '../types';

const script: Action = (data: any, metadata: any) => {
  const { path } = metadata.action as { path: string };
  const child = exec(path, { async: true });
  child.stdin?.write(JSON.stringify({ data, metadata }));
  child.stdin?.end();
};

export default script;
