declare const CredencePlugin: ({ $, client, worktree, directory }: import("@opencode-ai/plugin").PluginInput, options: import("@opencode-ai/plugin").PluginOptions | undefined) => Promise<{
    "tool.execute.after": (input: {
        tool: string;
        sessionID: string;
        callID: string;
        args: any;
    }) => Promise<void>;
    event: ({ event }: {
        event: import("@opencode-ai/sdk").Event;
    }) => Promise<void>;
}>;
export default CredencePlugin;
