import type { Plugin } from "@opencode-ai/plugin";
import { CredenceRunner, defaultOptions } from "./runner.js";

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

export default CredencePlugin;
