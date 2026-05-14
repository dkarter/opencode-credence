export const defaultOptions = {
    semantic: false,
    maxFiles: 25,
    exclude: ["deps/", "_build/", "priv/repo/migrations/"],
};
export class CredenceRunner {
    changed = new Set();
    $;
    client;
    cwd;
    options;
    constructor(input) {
        this.$ = input.$;
        this.client = input.client;
        this.cwd = input.cwd;
        this.options = { ...defaultOptions, ...input.options };
    }
    recordToolInput(input) {
        for (const path of filterElixirPaths(extractEditedPaths(input), this.options.exclude)) {
            this.changed.add(path);
        }
    }
    async flush() {
        const files = [...this.changed].slice(0, this.options.maxFiles);
        if (files.length === 0)
            return;
        this.changed.clear();
        const expression = buildCredenceExpression(files, this.options.semantic);
        const command = this.$ `mix run --no-start -e ${expression}`.nothrow().quiet();
        if (this.cwd)
            command.cwd(this.cwd);
        const output = await command.text();
        if (output.trim() !== "") {
            await this.log("warn", "Credence found issues", { output, files });
        }
        else {
            await this.log("debug", "Credence found no issues", { files });
        }
    }
    async log(level, message, extra) {
        await this.client?.app?.log?.({
            body: {
                service: "opencode-credence",
                level,
                message,
                extra,
            },
        });
    }
}
export function extractEditedPaths(input) {
    const paths = new Set();
    collectPaths(input, paths);
    return [...paths];
}
export function filterElixirPaths(paths, exclude = defaultOptions.exclude) {
    return paths.filter((path) => {
        const normalized = path.replaceAll("\\", "/");
        return /\.exs?$/.test(normalized) && !exclude.some((fragment) => normalized.includes(fragment));
    });
}
function collectPaths(value, paths) {
    if (typeof value === "string") {
        if (/\.exs?$/.test(value))
            paths.add(value);
        return;
    }
    if (Array.isArray(value)) {
        for (const item of value)
            collectPaths(item, paths);
        return;
    }
    if (!value || typeof value !== "object")
        return;
    for (const [key, nested] of Object.entries(value)) {
        if (isPathKey(key))
            collectPaths(nested, paths);
        else if (typeof nested === "object")
            collectPaths(nested, paths);
    }
}
function isPathKey(key) {
    return ["file", "files", "filePath", "file_path", "path", "paths"].includes(key);
}
export function buildCredenceExpression(files, semantic) {
    const analyzer = semantic ? "Credence.analyze(code).issues" : "Credence.Pattern.analyze(code)";
    const encodedFiles = `[${files.map((file) => JSON.stringify(file)).join(", ")}]`;
    return `files = ${encodedFiles}; for file <- files, File.exists?(file), code = File.read!(file), issues = ${analyzer}, issues != [] do IO.puts("\\n" <> file); Enum.each(issues, fn issue -> line = get_in(issue.meta, [:line]) || "?"; IO.puts("  #{line}: #{issue.rule} - #{issue.message}") end) end`;
}
