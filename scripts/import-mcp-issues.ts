#!/usr/bin/env bun
/**
 * Fetches open "[Server Request]" issues from cursor/mcp-servers on GitHub,
 * parses the structured issue body, and creates plugins in Supabase —
 * including uploading logos to Supabase Storage.
 *
 * Usage:
 *   bun scripts/import-mcp-issues.ts --dry-run       # preview without writing
 *   bun scripts/import-mcp-issues.ts --import         # actually insert into DB
 *   bun scripts/import-mcp-issues.ts --out plugins.json  # export JSON only
 *
 * Requires:
 *   - `gh` CLI authenticated
 *   - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
 *     (loaded from apps/cursor/.env.local automatically)
 */

import { execFileSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ── Load env from apps/cursor/.env.local ──────────────────────────────────

function loadEnv() {
  const candidates = [
    resolve(import.meta.dir, ".env.local"),
    resolve(import.meta.dir, "../apps/cursor/.env.local"),
  ];
  const envPath = candidates.find(existsSync);
  if (!envPath) return;
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx);
    const val = trimmed.slice(eqIdx + 1);
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

// ── Types ─────────────────────────────────────────────────────────────────

interface ParsedIssue {
  issueNumber: number;
  issueUrl: string;
  serverName: string;
  serverUrl: string;
  description: string;
  configJson: Record<string, unknown> | null;
  oauth: boolean;
  iconUrl: string | null;
  docsUrl: string | null;
  additionalContext: string | null;
  author: string;
  createdAt: string;
}

interface PluginData {
  name: string;
  slug: string;
  description: string | null;
  version: string;
  homepage: string | null;
  repository: string | null;
  license: string | null;
  logo: string | null;
  keywords: string[];
  author_name: string | null;
  active: boolean;
  components: ComponentData[];
  _source: {
    issueNumber: number;
    issueUrl: string;
  };
}

interface ComponentData {
  type: string;
  name: string;
  slug: string;
  description: string | null;
  content: string | null;
  metadata: Record<string, unknown>;
  sort_order: number;
}

// ── GitHub fetching ───────────────────────────────────────────────────────

const REPO = "cursor/mcp-servers";
const PER_PAGE = 100;

interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  html_url: string;
  user: { login: string };
  created_at: string;
  labels: { name: string }[];
}

function fetchAllOpenIssues(): GitHubIssue[] {
  const raw = execFileSync("gh", [
    "api",
    "--paginate",
    `repos/${REPO}/issues?state=open&per_page=${PER_PAGE}`,
  ], { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 });

  return parseConcatenatedJsonArrays(raw) as GitHubIssue[];
}

/**
 * gh --paginate concatenates raw JSON arrays without a separator,
 * e.g. "[…][…]". This parses them into a single flat array.
 */
function parseConcatenatedJsonArrays(input: string): unknown[] {
  try {
    const arr = JSON.parse(input);
    if (Array.isArray(arr)) return arr;
  } catch {
    // multiple arrays concatenated
  }

  const results: unknown[] = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === "[") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "]") {
      depth--;
      if (depth === 0 && start >= 0) {
        results.push(...JSON.parse(input.slice(start, i + 1)));
        start = -1;
      }
    }
  }

  return results;
}

function isServerRequest(issue: GitHubIssue): boolean {
  const titleLower = issue.title.toLowerCase();
  return (
    titleLower.includes("[server request]") ||
    titleLower.includes("server request:")
  );
}

// ── Body parsing ──────────────────────────────────────────────────────────

function extractSection(body: string, heading: string): string | null {
  const pattern = new RegExp(
    `### ${escapeRegex(heading)}\\s*\\n([\\s\\S]*?)(?=\\n### |$)`,
    "i",
  );
  const match = body.match(pattern);
  if (!match) return null;

  const text = match[1].trim();
  if (!text || text === "_No response_") return null;
  return text;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractConfigJson(body: string): Record<string, unknown> | null {
  const section = extractSection(body, "Configuration JSON");
  if (!section) return null;

  const codeBlockMatch = section.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : section.trim();

  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.mcpServers) {
      const servers = parsed.mcpServers;
      const keys = Object.keys(servers);
      if (keys.length === 1) {
        return servers[keys[0]] as Record<string, unknown>;
      }
    }
    return parsed;
  } catch {
    const jsonMatch = section.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.mcpServers) {
          const servers = parsed.mcpServers;
          const keys = Object.keys(servers);
          if (keys.length === 1) {
            return servers[keys[0]] as Record<string, unknown>;
          }
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function extractOAuth(body: string): boolean {
  const section = extractSection(body, "Authentication");
  if (!section) return false;
  return section.includes("[x]") || section.includes("[X]");
}

function extractIconUrl(body: string): string | null {
  const imgPatterns = [
    /!\[.*?\]\((https:\/\/github\.com\/user-attachments\/assets\/[^\s)]+)\)/,
    /<img[^>]+src="(https:\/\/github\.com\/user-attachments\/assets\/[^\s"]+)"/,
    /https:\/\/github\.com\/user-attachments\/assets\/[a-f0-9-]+/,
  ];

  for (const pattern of imgPatterns) {
    const match = body.match(pattern);
    if (match) return match[1] || match[0];
  }
  return null;
}

function parseIssueBody(issue: GitHubIssue): ParsedIssue | null {
  const { body } = issue;
  if (!body) return null;

  const serverName = extractSection(body, "Server Name");
  if (!serverName) return null;

  const serverUrl = extractSection(body, "Server URL/Repository");
  const description = extractSection(body, "Description");

  if (!description) return null;

  return {
    issueNumber: issue.number,
    issueUrl: issue.html_url,
    serverName,
    serverUrl: serverUrl || "",
    description,
    configJson: extractConfigJson(body),
    oauth: extractOAuth(body),
    iconUrl: extractIconUrl(body),
    docsUrl: extractSection(body, "Documentation URL (if applicable)"),
    additionalContext: extractSection(body, "Additional Context"),
    author: issue.user.login,
    createdAt: issue.created_at,
  };
}

// ── Transform to plugin format ────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toPluginData(parsed: ParsedIssue): PluginData {
  const slug = slugify(parsed.serverName);

  const mcpConfig: Record<string, unknown> = {};
  if (parsed.configJson) {
    mcpConfig.mcpServers = {
      [slug]: parsed.configJson,
    };
  }
  if (parsed.oauth) {
    mcpConfig.oauth = true;
  }

  const component: ComponentData = {
    type: "mcp_server",
    name: parsed.serverName,
    slug,
    description: parsed.description,
    content: null,
    metadata: {
      config: mcpConfig,
      ...(parsed.docsUrl ? { docsUrl: parsed.docsUrl } : {}),
      ...(parsed.serverUrl ? { serverUrl: parsed.serverUrl } : {}),
    },
    sort_order: 0,
  };

  const keywords = ["mcp", "cursor"];
  if (parsed.oauth) keywords.push("oauth");

  return {
    name: parsed.serverName,
    slug,
    description: parsed.description,
    version: "1.0.0",
    homepage: parsed.docsUrl || parsed.serverUrl || null,
    repository: parsed.serverUrl || null,
    license: null,
    logo: parsed.iconUrl || null,
    keywords,
    author_name: parsed.author,
    active: false,
    components: [component],
    _source: {
      issueNumber: parsed.issueNumber,
      issueUrl: parsed.issueUrl,
    },
  };
}

// ── Dedup ─────────────────────────────────────────────────────────────────

function fetchExistingServerSlugs(): Set<string> {
  try {
    const raw = execFileSync("gh", [
      "api",
      `repos/${REPO}/contents/servers`,
      "--jq", ".[].name",
    ], { encoding: "utf-8" });
    return new Set(raw.trim().split("\n").filter(Boolean));
  } catch {
    console.error("Warning: could not fetch existing server slugs for dedup");
    return new Set();
  }
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

function requireSupabase() {
  const sb = getSupabase();
  if (!sb) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Make sure apps/cursor/.env.local exists with these values.",
    );
  }
  return sb;
}

async function fetchExistingPluginIdentifiers(): Promise<Set<string>> {
  try {
    const supabase = getSupabase();
    if (!supabase) return new Set();
    const ids = new Set<string>();
    let from = 0;
    const PAGE_SIZE = 1000;

    while (true) {
      const { data, error } = await supabase
        .from("plugins")
        .select("slug, name")
        .range(from, from + PAGE_SIZE - 1);

      if (error || !data || data.length === 0) break;
      for (const row of data) {
        ids.add(row.slug);
        ids.add(slugify(row.name));
      }
      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    return ids;
  } catch (err) {
    console.error("Warning: could not fetch existing plugin slugs:", err);
    return new Set();
  }
}

// ── Logo upload ───────────────────────────────────────────────────────────

async function downloadImage(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0 || buffer.length > 5 * 1024 * 1024) return null;
    return { buffer, contentType };
  } catch {
    return null;
  }
}

function extFromContentType(ct: string): string {
  if (ct.includes("svg")) return "svg";
  if (ct.includes("png")) return "png";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("gif")) return "gif";
  return "png";
}

async function uploadLogo(
  slug: string,
  imageUrl: string,
): Promise<string | null> {
  const img = await downloadImage(imageUrl);
  if (!img) return null;

  const supabase = requireSupabase();
  const ext = extFromContentType(img.contentType);
  const fileName = `plugins/${slug}.${ext}`;

  const { error } = await supabase.storage
    .from("mcp-logos")
    .upload(fileName, img.buffer, {
      contentType: img.contentType,
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error(`  ⚠ Logo upload failed for ${slug}: ${error.message}`);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from("mcp-logos")
    .getPublicUrl(fileName);

  return publicUrl;
}

// ── Supabase insert ───────────────────────────────────────────────────────

interface ImportResult {
  slug: string;
  issueNumber: number;
  status: "created" | "skipped" | "error";
  error?: string;
}

async function insertPlugin(plugin: PluginData): Promise<ImportResult> {
  const supabase = requireSupabase();
  const src = plugin._source;

  // Check if a plugin with this name already exists
  const { data: existing } = await supabase
    .from("plugins")
    .select("id")
    .eq("name", plugin.name)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return { slug: plugin.slug, issueNumber: src.issueNumber, status: "skipped" };
  }

  // Upload logo if we have one
  let logoUrl = plugin.logo;
  if (logoUrl) {
    const uploaded = await uploadLogo(plugin.slug, logoUrl);
    if (uploaded) logoUrl = uploaded;
  }

  // Insert plugin row
  const { data: row, error: pluginError } = await supabase
    .from("plugins")
    .insert({
      name: plugin.name,
      description: plugin.description,
      logo: logoUrl,
      repository: plugin.repository,
      homepage: plugin.homepage,
      keywords: plugin.keywords,
      active: false,
      plan: "standard",
    })
    .select("id, slug")
    .single();

  if (pluginError) {
    if (pluginError.code === "23505") {
      return { slug: plugin.slug, issueNumber: src.issueNumber, status: "skipped" };
    }
    return {
      slug: plugin.slug,
      issueNumber: src.issueNumber,
      status: "error",
      error: pluginError.message,
    };
  }

  // Insert components
  const componentRows = plugin.components.map((comp, i) => ({
    plugin_id: row.id,
    type: comp.type,
    name: comp.name,
    slug: comp.slug,
    description: comp.description,
    content: comp.content,
    metadata: comp.metadata,
    sort_order: i,
  }));

  const { error: compError } = await supabase
    .from("plugin_components")
    .insert(componentRows);

  if (compError) {
    await supabase.from("plugins").delete().eq("id", row.id);
    return {
      slug: plugin.slug,
      issueNumber: src.issueNumber,
      status: "error",
      error: `Components: ${compError.message}`,
    };
  }

  return { slug: row.slug, issueNumber: src.issueNumber, status: "created" };
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const doImport = args.includes("--import");
  const outIdx = args.indexOf("--out");
  const outFile = outIdx >= 0 ? args[outIdx + 1] : null;
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;
  const skipExisting = !args.includes("--include-existing");

  if (!dryRun && !doImport && !outFile) {
    console.error("Usage:");
    console.error("  bun scripts/import-mcp-issues.ts --dry-run");
    console.error("  bun scripts/import-mcp-issues.ts --import");
    console.error("  bun scripts/import-mcp-issues.ts --out plugins.json");
    process.exit(1);
  }

  console.error("Fetching open issues from cursor/mcp-servers...");
  const issues = fetchAllOpenIssues();
  console.error(`  Found ${issues.length} open issues`);

  const serverRequests = issues.filter(isServerRequest);
  console.error(`  ${serverRequests.length} are [Server Request] issues`);

  const parsed = serverRequests
    .map(parseIssueBody)
    .filter((p): p is ParsedIssue => p !== null);
  console.error(`  ${parsed.length} parsed successfully`);

  const failedParse = serverRequests.length - parsed.length;
  if (failedParse > 0) {
    console.error(`  ${failedParse} issues could not be parsed (missing required fields)`);
  }

  let plugins = parsed.map(toPluginData);

  if (skipExisting) {
    console.error("Deduplicating against existing servers + plugins...");

    const [repoSlugs, pluginSlugs] = await Promise.all([
      fetchExistingServerSlugs(),
      fetchExistingPluginIdentifiers(),
    ]);

    const combined = new Set([...repoSlugs, ...pluginSlugs]);
    const before = plugins.length;
    plugins = plugins.filter((p) => !combined.has(p.slug));
    const skipped = before - plugins.length;
    if (skipped > 0) {
      console.error(`  Skipped ${skipped} that already exist (${repoSlugs.size} repo servers, ${pluginSlugs.size} directory plugins)`);
    }
  }

  if (limit < plugins.length) {
    plugins = plugins.slice(0, limit);
    console.error(`  Limited to ${limit} plugins`);
  }

  console.error(`\nResult: ${plugins.length} new plugins ready for import\n`);

  // ── Dry run ──
  if (dryRun) {
    console.error("── Dry run summary ──────────────────────────────");
    for (const p of plugins) {
      const hasConfig = p.components[0]?.metadata?.config != null;
      const hasLogo = p.logo != null;
      console.error(
        `  #${p._source.issueNumber} ${p.name} (${p.slug})` +
        `${hasConfig ? "" : " ⚠ no config"}` +
        `${hasLogo ? " 🖼" : ""}`,
      );
    }
    console.error(`\nTotal: ${plugins.length} plugins`);
    return;
  }

  // ── Export JSON ──
  if (outFile) {
    const output = JSON.stringify(plugins, null, 2);
    writeFileSync(outFile, output, "utf-8");
    console.error(`Written to ${outFile}`);
    return;
  }

  // ── Import into Supabase ──
  if (doImport) {
    console.error("── Importing into Supabase ──────────────────────");
    const results: ImportResult[] = [];

    for (let i = 0; i < plugins.length; i++) {
      const p = plugins[i];
      const prefix = `  [${i + 1}/${plugins.length}]`;
      console.error(`${prefix} #${p._source.issueNumber} ${p.name}...`);

      const result = await insertPlugin(p);
      results.push(result);

      if (result.status === "created") {
        console.error(`${prefix} ✓ Created (${result.slug})`);
      } else if (result.status === "skipped") {
        console.error(`${prefix} – Skipped (already exists)`);
      } else {
        console.error(`${prefix} ✗ Error: ${result.error}`);
      }
    }

    const created = results.filter((r) => r.status === "created").length;
    const skipped = results.filter((r) => r.status === "skipped").length;
    const errors = results.filter((r) => r.status === "error").length;

    console.error(`\n── Done ────────────────────────────────────────`);
    console.error(`  Created: ${created}`);
    console.error(`  Skipped: ${skipped}`);
    console.error(`  Errors:  ${errors}`);

    if (errors > 0) {
      console.error("\nFailed:");
      for (const r of results.filter((r) => r.status === "error")) {
        console.error(`  #${r.issueNumber} ${r.slug}: ${r.error}`);
      }
    }
  }
}

main();
