import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
  buildCredenceExpression,
  CredenceRunner,
  extractEditedPaths,
  filterElixirPaths,
} from "./runner.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = join(repoRoot, "fixtures", "elixir_project");

describe("extractEditedPaths", () => {
  it("finds Elixir paths in common opencode tool argument shapes", () => {
    const paths = extractEditedPaths({
      tool: "apply_patch",
      args: {
        filePath: "lib/connect/foo.ex",
        paths: ["test/connect/foo_test.exs", "assets/app.ts"],
      },
      result: {
        files: [{ path: "lib/connect/bar.ex" }],
      },
    });

    expect(paths.sort()).toEqual([
      "lib/connect/bar.ex",
      "lib/connect/foo.ex",
      "test/connect/foo_test.exs",
    ]);
  });
});

describe("filterElixirPaths", () => {
  it("keeps Elixir files and drops default excluded paths", () => {
    expect(
      filterElixirPaths([
        "lib/a.ex",
        "test/a_test.exs",
        "deps/pkg/lib/a.ex",
        "_build/test/lib/a.ex",
        "priv/repo/migrations/20260101000000_add_a.exs",
        "assets/a.ts",
      ]),
    ).toEqual(["lib/a.ex", "test/a_test.exs"]);
  });
});

describe("CredenceRunner", () => {
  it("records changed files and scans once on flush", async () => {
    const logs: unknown[] = [];
    const command = {
      nothrow: vi.fn(() => command),
      quiet: vi.fn(() => command),
      cwd: vi.fn(() => command),
      text: vi.fn(async () => "\nlib/a.ex\n  1: no_redundant_assignment - example"),
    };
    const shell = vi.fn(() => command);
    Object.assign(shell, {
      braces: vi.fn(),
      escape: vi.fn(),
      env: vi.fn(() => shell),
      cwd: vi.fn(() => shell),
      nothrow: vi.fn(() => shell),
      throws: vi.fn(() => shell),
    });

    const runner = new CredenceRunner({
      $: shell as never,
      cwd: "/repo",
      client: {
        app: {
          log: async (input) => {
            logs.push(input);
          },
        },
      },
    });

    runner.recordToolInput({ args: { filePath: "lib/a.ex" } });
    runner.recordToolInput({ args: { filePath: "assets/a.ts" } });

    await runner.flush();
    await runner.flush();

    expect(shell).toHaveBeenCalledTimes(1);
    expect(command.cwd).toHaveBeenCalledWith("/repo");
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      body: {
        service: "opencode-credence",
        level: "warn",
        message: "Credence found issues",
      },
    });
  });

  it("does nothing when no Elixir files changed", async () => {
    const shell = vi.fn();
    Object.assign(shell, {
      braces: vi.fn(),
      escape: vi.fn(),
      env: vi.fn(() => shell),
      cwd: vi.fn(() => shell),
      nothrow: vi.fn(() => shell),
      throws: vi.fn(() => shell),
    });
    const runner = new CredenceRunner({ $: shell as never });

    runner.recordToolInput({ args: { filePath: "assets/a.ts" } });
    await runner.flush();

    expect(shell).not.toHaveBeenCalled();
  });
});

describe("elixir fixture", () => {
  it("builds a Credence expression that reports fixture issues", () => {
    const expression = buildCredenceExpression(["lib/fixture_app/problematic.ex"], false);

    expect(expression).toContain("Credence.Pattern.analyze(code)");
    expect(expression).toContain("lib/fixture_app/problematic.ex");
  });

  it.runIf(
    process.env.RUN_CREDENCE_FIXTURE === "1" && existsSync(join(fixtureRoot, "deps", "credence")),
  )(
    "runs Credence against the fixture project",
    () => {
      const expression = buildCredenceExpression(["lib/fixture_app/problematic.ex"], false);
      const output = execFileSync("mix", ["run", "--no-start", "-e", expression], {
        cwd: fixtureRoot,
        encoding: "utf8",
      });

      expect(output).toContain("lib/fixture_app/problematic.ex");
      expect(output).toContain("no_length_comparison_for_empty");
    },
  );
});
