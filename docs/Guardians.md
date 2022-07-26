# Guardians

A Guardian's only job is to connect to the node and be provided a list of tasks it can run. You can either extend a built-in guardian or create a new one. See the following example:

```typescript
import { firstValueFrom } from 'rxjs';
import MyTask from './MyTask.js';

export default class MyGuardian extends BaseSubstrateGuardian<
  MyGuardianConfigType,
  { apiRx: ApiRx } /* instances guardian provides to the task */
> {
  tasks(): {[key: string]: TaskConstructor} {
    return {
      ...super.tasks(),
      'my_task': MyTask, // your custom tasks
    };
  }

  async setup(config: MyGuardianConfigType): { apiRx: ApiRx } {
    const privider = new WsProvider(config.nodeEndpoint);
    const apiRx = await firstValueFrom(ApiRx.create({ provider }));
    // do any setup. In case of a substrate base guardian you probably need an ApiRx instance.
    return { apiRx };
  }

  validationSchema(): Joi.Schema {
    // return Joi.Schema to validate arguments given to the guardian
  }
}
```

then in your `index.js` file you can register your guardian: 

```typescript
import { GuardianRegistry } from '@open-web3/guardian';
import MyGuardian from './MyGuardian.js';

GuardianRegistry.register('myGuardian', MyGuardian);

// start guardian
require('@open-web3/guardian-cli');
```

Your YAML config will then be:

```yaml
version: '0.1'
guardians:
  - chain: myGuardian # identifier you registered your guardian
    nodeEndpoint: ${NODE_ENDPOINT} # rest of arguments required to setup your guardian...
```

Finally you can run `node index.js --config=config.yml` to start your guardian.