import type { Plugin } from "@opencode-ai/plugin";
import { CredenceRunner, defaultOptions, extractEditedPaths, filterElixirPaths } from "./runner.js";

export type { CredenceOptions } from "./runner.js";
export { CredenceRunner, extractEditedPaths, filterElixirPaths };

const CredencePlugin = (async ({ $, client, worktree, directory }, options) => {
  const runner = new CredenceRunner({
    $,
    client,
    cwd: worktree ?? directory,
    options: { ...defaultOptions, ...options },
  });

  return {
    "tool.execute.after": async (input) => {
      runner.recordToolInput(input);
    },

    event: async ({ event }) => {
      if (event.type === "session.idle") {
        await runner.flush();
      }
    },
  };
}) satisfies Plugin;

export { CredencePlugin };
export default CredencePlugin;
