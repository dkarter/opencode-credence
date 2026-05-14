# Elixir Fixture

Tiny Mix project used by plugin tests.

Install fixture dependencies before running the optional integration test:

```sh
mix deps.get
RUN_CREDENCE_FIXTURE=1 aube run test
```

The default unit test suite does not fetch Hex dependencies. It only verifies that the plugin builds the same Credence expression used by the runtime hook.
