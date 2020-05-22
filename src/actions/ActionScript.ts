import shell from 'shelljs';
import { IAction } from '../types';

type Args = { path: string };

export default class ActionScript implements IAction<Args> {
  method = 'script';

  run(args: Args, data: any) {
    const { path } = args;
    const child = shell.exec(path, { async: true });
    child.stdin.write(JSON.stringify(data));
    child.stdin.end();
  }
}
