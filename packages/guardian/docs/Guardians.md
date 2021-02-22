# Guardians
Guardians only task is to connect to the node and provide a list of tasks it can run. You can either extend a build-in guardian or create a new one. See following example:
```typescript
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
    const apiRx = await ApiRx.create({ provider }).toPromise();
    // do any setup. In case of a substrate base guardian you probably need an ApiRx instance.
    return { apiRx };
  }

  validationSchema(): Joi.Schema {
    // return Joi.Schema to validate arguments given to the guardian
  }
}
```
then on your `index.js` you can register your guardian calling 
```typescript
import { GuardianRegistry } from '@open-web3/guardian';
import MyGuardian from './MyGuardian.js';

GuardianRegistry.register('myChain', MyGuardian);

// start guardian
require('@open-web3/guardian-cli');
```

Your YAML config then will be:
```yaml
version: '0.1'
guardians:
  my-first-guardian: # any name
    networkType: myChain # identifier you registered your guardian
    nodeEndpoint: ${NODE_ENDPOINT} # rest of arguments required to setup your guardian...
```

Finally you can run `node index.js --config=config.yml`