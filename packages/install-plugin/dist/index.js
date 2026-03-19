#!/usr/bin/env node
import * as fs from "node:fs";
import * as path from "node:path";
import * as clack from "@clack/prompts";
const API_BASE = process.env.CURSOR_DIRECTORY_API ?? "https://cursor.directory";
// ── Colors ─────────────────────────────────────────────────────────────
const isColorSupported = process.env.FORCE_COLOR !== "0" &&
    (process.env.FORCE_COLOR !== undefined || process.stdout.isTTY);
const fmt = (open, close) => isColorSupported
    ? (s) => `\x1b[${open}m${s}\x1b[${close}m`
    : (s) => s;
const bold = fmt("1", "22");
const dim = fmt("2", "22");
const green = fmt("32", "39");
const red = fmt("31", "39");
const yellow = fmt("33", "39");
const cyan = fmt("36", "39");
function printUsage() {
    console.log(`
${bold("install-plugin")} — Install plugins from the Cursor Directory

${bold("USAGE")}
  ${cyan("install-plugin")} ${dim("<slug>")} ${dim("[options]")}

${bold("OPTIONS")}
  ${cyan("--force")}              Overwrite existing files without warning
  ${cyan("--dry-run")}            Show what would be installed without writing files
  ${cyan("--all")}                Install all components without prompting
  ${cyan("--only")} ${dim("<a,b,c>")}      Only install components with these slugs
  ${cyan("--exclude")} ${dim("<a,b,c>")}   Skip components with these slugs
  ${cyan("--help")}               Show this help message

${bold("EXAMPLES")}
  ${dim("$")} install-plugin nextjs
  ${dim("$")} install-plugin nextjs --only nextjs,payload-cms-nextjs-typescript-best-practices
  ${dim("$")} install-plugin nextjs --exclude nextjs-react-redux-typescript-cursor-rules
  ${dim("$")} install-plugin mcp-supabase --all --force
`);
}
function parseArgs(argv) {
    const args = argv.slice(2);
    let slug = null;
    let force = false;
    let dryRun = false;
    let all = false;
    let only = [];
    let exclude = [];
    let help = false;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === "--force")
            force = true;
        else if (arg === "--dry-run")
            dryRun = true;
        else if (arg === "--all")
            all = true;
        else if (arg === "--help" || arg === "-h")
            help = true;
        else if (arg === "--only" && args[i + 1]) {
            only = args[++i].split(",").filter(Boolean);
        }
        else if (arg === "--exclude" && args[i + 1]) {
            exclude = args[++i].split(",").filter(Boolean);
        }
        else if (!arg.startsWith("-"))
            slug = arg;
    }
    return { slug, force, dryRun, all, only, exclude, help };
}
// ── Fetch ──────────────────────────────────────────────────────────────
async function fetchPlugin(slug) {
    const url = `${API_BASE}/api/plugins/${encodeURIComponent(slug)}`;
    const res = await fetch(url);
    if (res.status === 404) {
        throw new Error(`Plugin ${bold(`"${slug}"`)} not found on cursor.directory`);
    }
    if (!res.ok) {
        throw new Error(`Failed to fetch plugin (HTTP ${res.status}): ${res.statusText}`);
    }
    const json = (await res.json());
    if (json.error || !json.data) {
        throw new Error(json.error ?? "Unexpected response from API");
    }
    return json.data;
}
// ── File helpers ───────────────────────────────────────────────────────
function ensureDir(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}
function readJsonFile(filePath) {
    if (!fs.existsSync(filePath))
        return {};
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    catch {
        return {};
    }
}
function writeJsonFile(filePath, data) {
    ensureDir(filePath);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}
function writeTextFile(filePath, content) {
    ensureDir(filePath);
    fs.writeFileSync(filePath, content, "utf-8");
}
// ── Installers per component type ──────────────────────────────────────
function installRule(cwd, comp, force) {
    const filePath = path.join(cwd, ".cursor", "rules", `${comp.slug}.mdc`);
    const exists = fs.existsSync(filePath);
    if (exists && !force) {
        return { component: comp, path: filePath, action: "skipped" };
    }
    writeTextFile(filePath, comp.content ?? "");
    return { component: comp, path: filePath, action: exists ? "updated" : "created" };
}
function installMcpServer(cwd, comp, force) {
    const filePath = path.join(cwd, ".cursor", "mcp.json");
    const exists = fs.existsSync(filePath);
    const config = readJsonFile(filePath);
    if (!config.mcpServers || typeof config.mcpServers !== "object") {
        config.mcpServers = {};
    }
    const servers = config.mcpServers;
    const alreadyExists = comp.name in servers;
    if (alreadyExists && !force) {
        return { component: comp, path: filePath, action: "skipped" };
    }
    const metaConfig = comp.metadata?.config;
    if (comp.content) {
        try {
            servers[comp.name] = JSON.parse(comp.content);
        }
        catch {
            servers[comp.name] = { note: "Could not parse MCP config" };
        }
    }
    else if (metaConfig?.mcpServers) {
        const incoming = metaConfig.mcpServers;
        for (const [name, cfg] of Object.entries(incoming)) {
            servers[name] = cfg;
        }
    }
    writeJsonFile(filePath, config);
    return {
        component: comp,
        path: filePath,
        action: alreadyExists ? "updated" : "created",
    };
}
function installSkill(cwd, comp, force) {
    const filePath = path.join(cwd, ".cursor", "skills", comp.slug, "SKILL.md");
    const exists = fs.existsSync(filePath);
    if (exists && !force) {
        return { component: comp, path: filePath, action: "skipped" };
    }
    writeTextFile(filePath, comp.content ?? "");
    return { component: comp, path: filePath, action: exists ? "updated" : "created" };
}
function installAgent(cwd, comp, force) {
    const filePath = path.join(cwd, ".cursor", "agents", `${comp.slug}.md`);
    const exists = fs.existsSync(filePath);
    if (exists && !force) {
        return { component: comp, path: filePath, action: "skipped" };
    }
    writeTextFile(filePath, comp.content ?? "");
    return { component: comp, path: filePath, action: exists ? "updated" : "created" };
}
function installCommand(cwd, comp, force) {
    const filePath = path.join(cwd, ".cursor", "commands", `${comp.slug}.md`);
    const exists = fs.existsSync(filePath);
    if (exists && !force) {
        return { component: comp, path: filePath, action: "skipped" };
    }
    writeTextFile(filePath, comp.content ?? "");
    return { component: comp, path: filePath, action: exists ? "updated" : "created" };
}
function installHook(cwd, comp, force) {
    const filePath = path.join(cwd, ".cursor", "hooks", "hooks.json");
    const exists = fs.existsSync(filePath);
    if (exists && !force) {
        return { component: comp, path: filePath, action: "skipped" };
    }
    if (comp.content) {
        try {
            const incoming = JSON.parse(comp.content);
            const existing = readJsonFile(filePath);
            const merged = { ...existing, ...incoming };
            writeJsonFile(filePath, merged);
        }
        catch {
            writeTextFile(filePath, comp.content);
        }
    }
    return { component: comp, path: filePath, action: exists ? "updated" : "created" };
}
function installLspServer(cwd, comp, force) {
    const filePath = path.join(cwd, ".cursor", "lsp.json");
    const exists = fs.existsSync(filePath);
    const config = readJsonFile(filePath);
    const alreadyExists = comp.name in config;
    if (alreadyExists && !force) {
        return { component: comp, path: filePath, action: "skipped" };
    }
    if (comp.content) {
        try {
            config[comp.name] = JSON.parse(comp.content);
        }
        catch {
            config[comp.name] = { note: "Could not parse LSP config" };
        }
    }
    writeJsonFile(filePath, config);
    return {
        component: comp,
        path: filePath,
        action: alreadyExists ? "updated" : "created",
    };
}
function installComponent(cwd, comp, force) {
    switch (comp.type) {
        case "rule":
            return installRule(cwd, comp, force);
        case "mcp_server":
            return installMcpServer(cwd, comp, force);
        case "skill":
            return installSkill(cwd, comp, force);
        case "agent":
            return installAgent(cwd, comp, force);
        case "command":
            return installCommand(cwd, comp, force);
        case "hook":
            return installHook(cwd, comp, force);
        case "lsp_server":
            return installLspServer(cwd, comp, force);
        default:
            return { component: comp, path: "", action: "skipped" };
    }
}
// ── Labels ─────────────────────────────────────────────────────────────
const TYPE_LABELS = {
    rule: "Rule",
    mcp_server: "MCP Server",
    skill: "Skill",
    agent: "Agent",
    command: "Command",
    hook: "Hook",
    lsp_server: "LSP Server",
};
// ── Component selection ────────────────────────────────────────────────
function filterComponents(components, only, exclude) {
    if (only.length > 0) {
        return components.filter((c) => only.includes(c.slug));
    }
    if (exclude.length > 0) {
        return components.filter((c) => !exclude.includes(c.slug));
    }
    return components;
}
async function promptComponentSelection(components) {
    if (components.length <= 1)
        return components;
    const selected = await clack.multiselect({
        message: "Select components to install",
        options: components.map((c) => ({
            value: c.slug,
            label: c.name,
            hint: TYPE_LABELS[c.type] ?? c.type,
        })),
        initialValues: components.map((c) => c.slug),
        required: true,
    });
    if (clack.isCancel(selected)) {
        clack.cancel("Installation cancelled.");
        process.exit(0);
    }
    const slugSet = new Set(selected);
    return components.filter((c) => slugSet.has(c.slug));
}
// ── Dry run path resolver ──────────────────────────────────────────────
function installComponentDryRun(cwd, comp) {
    const pathMap = {
        rule: path.join(cwd, ".cursor", "rules", `${comp.slug}.mdc`),
        mcp_server: path.join(cwd, ".cursor", "mcp.json"),
        skill: path.join(cwd, ".cursor", "skills", comp.slug, "SKILL.md"),
        agent: path.join(cwd, ".cursor", "agents", `${comp.slug}.md`),
        command: path.join(cwd, ".cursor", "commands", `${comp.slug}.md`),
        hook: path.join(cwd, ".cursor", "hooks", "hooks.json"),
        lsp_server: path.join(cwd, ".cursor", "lsp.json"),
    };
    const filePath = pathMap[comp.type] ?? "";
    return { component: comp, path: filePath, action: "created" };
}
// ── Main ───────────────────────────────────────────────────────────────
async function main() {
    const { slug, force, dryRun, all, only, exclude, help } = parseArgs(process.argv);
    if (help || !slug) {
        printUsage();
        process.exit(help ? 0 : 1);
    }
    const cwd = process.cwd();
    const isInteractive = process.stdout.isTTY && !all && only.length === 0 && exclude.length === 0;
    clack.intro(`${bold("cursor.directory")} ${dim("/")} ${cyan(slug)}`);
    const s = clack.spinner();
    s.start("Fetching plugin from cursor.directory...");
    let plugin;
    try {
        plugin = await fetchPlugin(slug);
        s.stop(`${bold(plugin.name)} ${dim(`v${plugin.version}`)}`);
    }
    catch (err) {
        s.stop("Failed to fetch plugin");
        clack.log.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
    }
    if (plugin.description) {
        clack.log.info(dim(plugin.description));
    }
    let components = plugin.components;
    if (components.length === 0) {
        clack.log.warn("This plugin has no installable components.");
        clack.outro("Nothing to install.");
        process.exit(0);
    }
    // Filter components based on flags or interactive prompt
    if (only.length > 0 || exclude.length > 0) {
        components = filterComponents(components, only, exclude);
        if (components.length === 0) {
            clack.log.warn("No components matched the filter.");
            clack.outro("Nothing to install.");
            process.exit(0);
        }
    }
    else if (isInteractive) {
        components = await promptComponentSelection(components);
    }
    if (dryRun) {
        clack.log.info(dim("Dry run — no files will be written."));
    }
    const results = [];
    for (const comp of components) {
        const label = TYPE_LABELS[comp.type] ?? comp.type;
        if (dryRun) {
            const result = installComponentDryRun(cwd, comp);
            const relPath = path.relative(cwd, result.path) || result.path;
            clack.log.step(`${label}: ${bold(comp.name)} → ${dim(relPath)}`);
            results.push(result);
            continue;
        }
        try {
            const result = installComponent(cwd, comp, force);
            results.push(result);
            const relPath = path.relative(cwd, result.path) || result.path;
            if (result.action === "skipped") {
                clack.log.warn(`${label}: ${bold(comp.name)} → ${dim(relPath)} ${dim("(exists, use --force)")}`);
            }
            else if (result.action === "updated") {
                clack.log.step(`${label}: ${bold(comp.name)} → ${dim(relPath)} ${yellow("(updated)")}`);
            }
            else {
                clack.log.success(`${label}: ${bold(comp.name)} → ${dim(relPath)}`);
            }
        }
        catch (err) {
            clack.log.error(`${label}: ${bold(comp.name)} — ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    const created = results.filter((r) => r.action === "created").length;
    const updated = results.filter((r) => r.action === "updated").length;
    const skipped = results.filter((r) => r.action === "skipped").length;
    if (dryRun) {
        clack.outro(dim(`Dry run complete. ${results.length} component${results.length === 1 ? "" : "s"} would be installed.`));
    }
    else {
        const parts = [];
        if (created > 0)
            parts.push(green(`${created} created`));
        if (updated > 0)
            parts.push(yellow(`${updated} updated`));
        if (skipped > 0)
            parts.push(dim(`${skipped} skipped`));
        clack.outro(`${bold("Done!")} ${parts.join(dim(", "))}`);
    }
}
main();
