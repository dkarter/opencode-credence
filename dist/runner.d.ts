import type { PluginInput } from "@opencode-ai/plugin";
type BunShell = PluginInput["$"];
type LoggerClient = {
    app?: {
        log?: (input: any) => Promise<unknown>;
    };
};
export type CredenceOptions = {
    semantic?: boolean;
    maxFiles?: number;
    exclude?: string[];
};
type RunnerInput = {
    $: BunShell;
    client?: LoggerClient;
    cwd?: string;
    options?: CredenceOptions;
};
export declare const defaultOptions: {
    semantic: false;
    maxFiles: number;
    exclude: string[];
};
export declare class CredenceRunner {
    readonly changed: Set<string>;
    private readonly $;
    private readonly client?;
    private readonly cwd?;
    private readonly options;
    constructor(input: RunnerInput);
    recordToolInput(input: unknown): void;
    flush(): Promise<void>;
    private log;
}
export declare function extractEditedPaths(input: unknown): string[];
export declare function filterElixirPaths(paths: string[], exclude?: string[]): string[];
export declare function buildCredenceExpression(files: string[], semantic: boolean): string;
export {};
