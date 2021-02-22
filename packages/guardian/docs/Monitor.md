# Monitor

Monitor is designed to listen to a task output and if conditions are fulfilled then execute some actions, like running a script or doing http requests. Actions are not limited, you can have multiple actions of the same type as well and they will be called at the same time. You can create and register custom action and use them everywhere.
Monitors are defined inside the guardian and you can have multiple of them in a guardian. See example below:
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
          - free: < 1000000000000000000
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