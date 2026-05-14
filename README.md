# opencode-credence

`opencode-credence` runs [Credence](https://github.com/Cinderella-Man/credence) on Elixir files changed during an opencode session.

This is still a work in progress. Expect rough edges, especially around opencode plugin API changes and how different tools report edited file paths.

It does not scan after every write. The plugin records edited `*.ex` and `*.exs` files while tools run, then scans the batch when opencode emits `session.idle`. That keeps feedback useful without interrupting every edit.

## Requirements

- opencode with plugin support
- Elixir and Mix available in the project being edited
- Credence installed in that Elixir project

Add Credence to the target project's `mix.exs` if it is not already there:

```elixir
defp deps do
  [
    {:credence, "~> 0.5", only: [:dev, :test], runtime: false}
  ]
end
```

Then fetch deps:

```sh
mix deps.get
```

## Install from npm

After the package is published, add it to your opencode config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-credence"]
}
```

## Install from a local checkout

Build the plugin:

```sh
git clone https://github.com/dkarter/opencode-credence.git
cd opencode-credence
mise install
mise run install
mise run build
```

Point opencode at the built file:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["/absolute/path/to/opencode-credence/dist/index.js"]
}
```

## Configuration

```json
{
  "plugin": [
    [
      "opencode-credence",
      {
        "semantic": false,
        "maxFiles": 25,
        "exclude": ["deps/", "_build/", "priv/repo/migrations/"]
      }
    ]
  ]
}
```

Options:

- `semantic`: use `Credence.analyze/2` instead of `Credence.Pattern.analyze/2`. Defaults to `false`. Semantic analysis compiles source strings, so pattern-only analysis is the safer default.
- `maxFiles`: max files to scan in one idle pass. Defaults to `25`.
- `exclude`: path fragments to skip before scanning. Defaults to `deps/`, `_build/`, and `priv/repo/migrations/`.

## How it works

When opencode finishes a tool call, the plugin looks for edited Elixir paths in common tool argument shapes such as `filePath`, `path`, `paths`, and `files`. It stores those paths in memory for the current plugin process.

When the session goes idle, it runs:

```sh
mix run --no-start -e '<generated Credence expression>'
```

If Credence reports issues, the plugin writes them to the opencode app log under the `opencode-credence` service name.

## Development

This repo uses `mise` for tools and `aube` for JavaScript dependencies:

```sh
mise install
mise run install
mise run test
mise run typecheck
mise run build
mise run fmt-check
```

Run the optional fixture test with Credence installed in the fixture project:

```sh
cd fixtures/elixir_project
mix deps.get
cd ../..
RUN_CREDENCE_FIXTURE=1 mise run test
```

The normal test suite skips that fixture test so it does not fetch Hex packages during every run.
