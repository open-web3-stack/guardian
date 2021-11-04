# Actions

The Guardian library has a built-in action method `POST` for doing http calls, and an action method `script` for executing a script from a given path. They are called from an instance of `Monitor` when a task emits an output. You can also easily create and register your own custom actions with very simple functions that take task output and metadata. Metadata contains action itself and additional metadata from guardian executing the action. See the example below:

```typescript
import { Action } from '@open-web3/guardian/types';

const myAction: Action = (data: any, metadata: any) => {
  const { foo } = metadata.action as { foo: string };
  // do anything
};
```

then this action can be registered in your `index.js` file

```typescript
import { Action } from '@open-web3/guardian/types';
import { ActionRegistry } from '@open-web3/guardian';

const myAction: Action = (data: any, metadata: any) => {
  const { foo } = metadata.action as { foo: string };
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

Finally you can run `node index.js --config=config.yml` to start your Guardian.