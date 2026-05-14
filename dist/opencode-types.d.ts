export type PluginInput = {
    client: {
        app?: {
            log?: (input: any) => Promise<unknown>;
        };
    };
    directory: string;
    worktree?: string;
    $: BunShell;
};
export type PluginOptions = Record<string, unknown>;
export type Plugin = (input: PluginInput, options?: PluginOptions) => Promise<Hooks>;
export type Hooks = {
    event?: (input: {
        event: {
            type: string;
        } & Record<string, unknown>;
    }) => Promise<void>;
    "tool.execute.after"?: (input: {
        tool: string;
        sessionID: string;
        callID: string;
        args: unknown;
    }, output: {
        title: string;
        output: string;
        metadata: unknown;
    }) => Promise<void>;
};
export type BunShell = {
    (strings: TemplateStringsArray, ...expressions: ShellExpression[]): BunShellPromise;
    braces(pattern: string): string[];
    escape(input: string): string;
    env(newEnv?: Record<string, string | undefined>): BunShell;
    cwd(newCwd?: string): BunShell;
    nothrow(): BunShell;
    throws(shouldThrow: boolean): BunShell;
};
export type ShellExpression = {
    toString(): string;
} | Array<ShellExpression> | string | {
    raw: string;
} | ReadableStream;
export type BunShellPromise = Promise<unknown> & {
    cwd(newCwd: string): BunShellPromise;
    nothrow(): BunShellPromise;
    quiet(): BunShellPromise;
    text(encoding?: string): Promise<string>;
};
