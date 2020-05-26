import shell from 'shelljs';
import { Action } from '../types';

type Args = { path: string };

const script: Action<Args> = (args: Args, data: any) => {
  const { path } = args;
  const child = shell.exec(path, { async: true });
  child.stdin.write(JSON.stringify(data));
  child.stdin.end();
};

export default script;
