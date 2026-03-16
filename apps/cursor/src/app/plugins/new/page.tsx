import { PluginForm } from "@/components/forms/plugin-form";
import { getSession } from "@/utils/supabase/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Submit a Plugin | Cursor Directory",
  description:
    "Submit a plugin to Cursor Directory and reach 300k+ developers.",
};

const SUPPORTED_COMPONENTS = [
  {
    label: "Rules",
    path: "rules/*.mdc",
    href: "https://open-plugins.com/agent-builders/components/rules",
  },
  {
    label: "MCP Servers",
    path: ".mcp.json",
    href: "https://open-plugins.com/agent-builders/components/mcp-servers",
  },
  {
    label: "Skills",
    path: "skills/*/SKILL.md",
    href: "https://open-plugins.com/agent-builders/components/skills",
  },
  {
    label: "Agents",
    path: "agents/*.md",
    href: "https://open-plugins.com/agent-builders/components/agents",
  },
  {
    label: "Hooks",
    path: "hooks/hooks.json",
    href: "https://open-plugins.com/agent-builders/components/hooks",
  },
  {
    label: "LSP Servers",
    path: ".lsp.json",
    href: "https://open-plugins.com/agent-builders/components/lsp-servers",
  },
];

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect("/login?next=/plugins/new");
  }

  return (
    <div className="min-h-screen px-6 pt-24 md:pt-32">
      <div className="mx-auto w-full max-w-lg">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="marketing-page-title mb-3">Submit a Plugin</h1>
          <p className="marketing-copy mx-auto max-w-md">
            Paste a GitHub repo URL and we&apos;ll auto-detect everything.
            <br />
            We follow the{" "}
            <a
              href="https://open-plugins.com"
              target="_blank"
              rel="noreferrer"
              className="text-foreground border-b border-border border-dashed"
            >
              Open Plugins
            </a>{" "}
            standard.
          </p>
        </div>

        {/* Form */}
        <PluginForm />

        {/* Supported components */}
        <div className="mt-16 border-t border-border pt-8">
          <p className="section-eyebrow mb-4 text-center">
            We auto-detect these components from your repo
          </p>

          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_COMPONENTS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 shadow-cursor transition-colors hover:bg-accent"
              >
                <span className="text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                  {item.label}
                </span>
                <span className="text-[10px] font-mono text-text-tertiary">
                  {item.path}
                </span>
              </a>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <a
              href="https://open-plugins.com/plugin-builders/specification"
              target="_blank"
              rel="noreferrer"
              className="border-b border-border border-dashed hover:text-foreground transition-colors"
            >
              Specification
            </a>
            <span className="text-text-quaternary">/</span>
            <a
              href="https://open-plugins.com/plugin-builders"
              target="_blank"
              rel="noreferrer"
              className="border-b border-border border-dashed hover:text-foreground transition-colors"
            >
              Getting Started
            </a>
            <span className="text-text-quaternary">/</span>
            <a
              href="https://github.com/cursor/plugin-template"
              target="_blank"
              rel="noreferrer"
              className="border-b border-border border-dashed hover:text-foreground transition-colors"
            >
              Template
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
