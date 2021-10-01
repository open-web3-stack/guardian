# Monitor

A `monitor` is designed to listen to a task output and execute some actions, like running a script or performing http requests, if the provided conditions are fulfilled. The number of actions a guardian can perform for any given task is not limited, you can even have multiple actions of the same type and they will be called at the same time. You only need to create and register cutom actions once to be able to use them everywhere.

Monitors are defined inside the guardian's config file and you can have multiple of them in a guardian. See the example below:

```yaml
...
acala-guardian: # any name for your guardian
    ...
    monitors:
      my-monitor: # any name for your monitor
        task: system.accounts # task to run
        arguments: # arguments given to the task
          account: ${ADDRESS}
        conditions: # conditions that need to fulfill i.e: free lower than 1 ACA
          - free: < 1000000000000
        actions:
          - method: script # run a script
            path: ./my_script.py
          - method: POST # http call
            url: http://example.com # arguments are passed via body using json format
            headers: # optional additional headers
              X-API-KEY: ${API_KEY}
    ...
```
For more info see the [example](../example-guardian) that monitors `system.events` for `balances.Transfers`