import shell from 'shelljs';
import { IActionRunner } from '../types';

type Args = { path: string };

export default class ScriptRunner implements IActionRunner<Args> {
  method = 'script';

  run(args: Args, data: any) {
    const { path } = args;
    const child = shell.exec(path, { async: true });
    child.stdin.write(JSON.stringify(data));
    child.stdin.end();
  }
}
