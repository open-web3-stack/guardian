# Actions
Guardian library has build-in action method `POST` for doing http calls and action method `script` for executing a script with a given path. They are called from `Monitor` instance when task emits an output. You can easly create and register your custom actions. Actions are very simple functions that takes config arguments and task output. See example below:
```typescript
import { Action } from '@open-web3/guardian/types';

type Args = { foo: string };

const myAction: Action<Args> = (args: Args, data: any) => {
  const { foo } = args;
  // do anything
};
```
then this action can be registered on your `index.js`
```typescript
import { Action } from '@open-web3/guardian/types';
import { ActionRegistry } from '@open-web3/guardian';

type Args = { foo: string };

const myAction: Action<Args> = (args: Args, data: any) => {
  const { foo } = args;
  // do anything
};

ActionRegistry.register('myAction', myAction);

// start guardian
require('@open-web3/guardian-cli');
```

Your YAML config then will be:
```yaml
...
actions:
  - method: myAction # action registered above
    foo: "your argument for the action"
...
```

Finally you can run `node index.js --config=config.yml`