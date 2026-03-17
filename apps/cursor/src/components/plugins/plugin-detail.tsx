"use client";

import { CursorDeepLink } from "@/components/cursor-deeplink";
import { Card, CardContent } from "@/components/ui/card";
import type { PluginRow } from "@/data/queries";
import { cn } from "@/lib/utils";
import { PluginIconFallback } from "./plugin-icon";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { StarButton } from "./star-button";

function buildRuleDeepLink(name: string, content: string) {
  return `cursor://anysphere.cursor-deeplink/rule?name=${encodeURIComponent(name)}&text=${encodeURIComponent(content)}`;
}

type ComponentType = "rule" | "mcp_server" | "skill" | "agent" | "hook" | "lsp_server" | "command";

const COMPONENT_LABELS: Record<ComponentType, string> = {
  rule: "Rules",
  mcp_server: "MCP Servers",
  skill: "Skills",
  agent: "Agents",
  hook: "Hooks",
  lsp_server: "LSP Servers",
  command: "Commands",
};

export function PluginDetailView({
  plugin,
}: {
  plugin: PluginRow;
}) {
  const components = plugin.plugin_components ?? [];
  const componentTypes = [...new Set(components.map((c) => c.type))] as ComponentType[];
  const [activeTab, setActiveTab] = useState<ComponentType>(componentTypes[0] ?? "rule");

  const rules = components.filter((c) => c.type === "rule");
  const mcps = components.filter((c) => c.type === "mcp_server");
  const activeComponents = components.filter((c) => c.type === activeTab);

  const [expandedRule, setExpandedRule] = useState<string | null>(
    rules[0]?.slug ?? null,
  );

  return (
    <div className="min-h-screen px-4 pt-24 md:pt-32">
      <div className="page-shell max-w-4xl px-0 py-8">
        <div className="mb-6 flex items-center gap-4">
          {plugin.logo ? (
            <Image
              src={plugin.logo}
              alt={`${plugin.name} logo`}
              width={40}
              height={40}
              className={cn(
                "rounded-lg border border-border bg-card p-1",
                plugin.logo.endsWith(".svg") && "invert",
              )}
            />
          ) : (
            <PluginIconFallback size={40} />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-semibold tracking-tight">{plugin.name}</h1>
              <StarButton
                pluginId={plugin.id}
                slug={plugin.slug}
                starCount={plugin.star_count}
              />
            </div>
            {plugin.author_name && (
              <p className="mt-1 text-sm text-muted-foreground">
                by{" "}
                {plugin.author_url ? (
                  <Link
                    href={plugin.author_url}
                    target="_blank"
                    className="border-b border-dashed border-input text-foreground"
                  >
                    {plugin.author_name}
                  </Link>
                ) : (
                  plugin.author_name
                )}
              </p>
            )}
          </div>
        </div>

        <p className="mb-8 max-w-2xl text-[15px] leading-7 text-muted-foreground">
          {plugin.description}
        </p>

        <div className="mb-10 flex items-center gap-4">
          {plugin.homepage && (
            <Link
              href={plugin.homepage}
              target="_blank"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>Homepage</span>
              <ExternalLinkIcon />
            </Link>
          )}
          {plugin.repository && (
            <Link
              href={plugin.repository}
              target="_blank"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>Source</span>
              <ExternalLinkIcon />
            </Link>
          )}
        </div>

        {plugin.keywords.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {plugin.keywords.map((kw) => (
              <Link
                key={kw}
                href={`/plugins?q=${encodeURIComponent(kw)}`}
                className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-mono text-muted-foreground transition-colors hover:text-foreground"
              >
                {kw}
              </Link>
            ))}
          </div>
        )}

        {componentTypes.length > 1 && (
          <div className="mb-6 flex items-center gap-2">
            {componentTypes.map((type) => {
              const count = components.filter((c) => c.type === type).length;
              return (
                <button
                  key={type}
                  type="button"
                  className={cn(
                    "rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                    activeTab === type && "bg-accent text-foreground",
                  )}
                  onClick={() => setActiveTab(type)}
                >
                  {COMPONENT_LABELS[type]} ({count})
                </button>
              );
            })}
          </div>
        )}

        {activeTab === "rule" && rules.length > 0 && (
          <RulesSection
            rules={rules}
            expandedRule={expandedRule}
            setExpandedRule={setExpandedRule}
          />
        )}

        {activeTab === "mcp_server" && mcps.length > 0 && (
          <McpSection mcps={mcps} />
        )}

        {activeTab !== "rule" && activeTab !== "mcp_server" && activeComponents.length > 0 && (
          <GenericComponentSection components={activeComponents} type={activeTab} />
        )}
      </div>
    </div>
  );
}

function RulesSection({
  rules,
  expandedRule,
  setExpandedRule,
}: {
  rules: NonNullable<PluginRow["plugin_components"]>;
  expandedRule: string | null;
  setExpandedRule: (slug: string | null) => void;
}) {
  return (
    <div>
      <h2 className="section-eyebrow mb-4">
        {rules.length} {rules.length === 1 ? "rule" : "rules"}
      </h2>
      <div className="space-y-3">
        {rules.map((rule) => {
          const isExpanded = expandedRule === rule.slug;

          return (
            <div key={rule.slug} className="rounded-lg border border-border">
              <div className="flex items-center justify-between gap-4 p-4">
                <button
                  type="button"
                  className="flex items-center gap-2 min-w-0 text-left"
                  onClick={() =>
                    setExpandedRule(isExpanded ? null : rule.slug)
                  }
                >
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      isExpanded && "rotate-180",
                    )}
                  />
                  <span className="truncate text-sm font-medium">
                    {rule.name}
                  </span>
                </button>
                <a
                  href={buildRuleDeepLink(rule.slug, rule.content ?? "")}
                  className="shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  Add to Cursor
                </a>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="max-h-96 overflow-y-auto rounded-lg border border-border bg-editor p-4 font-mono text-xs leading-6 text-muted-foreground">
                    <code className="block whitespace-pre-wrap">
                      {rule.content}
                    </code>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function McpSection({
  mcps,
}: {
  mcps: NonNullable<PluginRow["plugin_components"]>;
}) {
  return (
    <div className="space-y-3">
      {mcps.map((mcp) => {
        const meta = mcp.metadata as Record<string, unknown>;
        const link = meta?.link as string | undefined;
        const mcpLink = meta?.mcp_link as string | undefined;

        return (
          <div
            key={mcp.slug}
            className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="shrink-0 rounded-md border border-border bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
                MCP
              </span>
              <span className="truncate text-sm font-medium">{mcp.name}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {link && (
                <Link
                  href={link}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  target="_blank"
                >
                  <span>Source</span>
                  <ExternalLinkIcon />
                </Link>
              )}
              {mcpLink && <CursorDeepLink mcp_link={mcpLink} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GenericComponentSection({
  components,
  type,
}: {
  components: NonNullable<PluginRow["plugin_components"]>;
  type: ComponentType;
}) {
  return (
    <div>
      <h2 className="section-eyebrow mb-4">
        {components.length} {COMPONENT_LABELS[type].toLowerCase()}
      </h2>
      <div className="space-y-3">
        {components.map((comp) => (
          <Card key={comp.slug} className="border-border bg-transparent">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-sm font-medium">{comp.name}</h3>
              {comp.description && (
                <p className="text-xs leading-5 text-muted-foreground">{comp.description}</p>
              )}
              {comp.content && (
                <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-editor p-4 font-mono text-xs leading-6 text-muted-foreground">
                  <code className="block whitespace-pre-wrap">
                    {comp.content}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="12"
      height="13"
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_106_981"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="12"
        height="13"
      >
        <rect y="0.5" width="12" height="12" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_106_981)">
        <path
          d="M3.2 9.5L2.5 8.8L7.3 4H3V3H9V9H8V4.7L3.2 9.5Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
