"use client";

import { createPluginAction } from "@/actions/create-plugin";
import { parseGitHubPluginAction } from "@/actions/parse-github-plugin";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Check,
  ChevronDown,
  Github,
  Loader2,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const COMPONENT_LABELS: Record<string, string> = {
  rule: "Rule",
  mcp_server: "MCP Server",
  skill: "Skill",
  agent: "Agent",
  hook: "Hook",
  lsp_server: "LSP Server",
  command: "Command",
};

const SUPPORTED_COMPONENTS = [
  {
    label: "Rules",
    path: "rules/*.mdc",
    href: "https://open-plugins.com/agent-builders/components/rules",
  },
  {
    label: "MCP Servers",
    path: ".mcp.json / mcp.json",
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
    label: "Commands",
    path: "commands/*.md",
    href: "https://open-plugins.com/agent-builders/components/commands",
  },
  {
    label: "LSP Servers",
    path: ".lsp.json",
    href: "https://open-plugins.com/agent-builders/components/lsp-servers",
  },
];

type ParsedComponent = {
  type: string;
  name: string;
  slug: string;
  description?: string;
  content?: string;
  metadata: Record<string, unknown>;
};

type ParsedPlugin = {
  name: string;
  description: string;
  version?: string;
  logo?: string;
  homepage?: string;
  repository: string;
  license?: string;
  keywords: string[];
  author_name?: string;
  author_url?: string;
  author_avatar?: string;
  components: ParsedComponent[];
};

const formSchema = z.object({
  url: z
    .string()
    .url("Please enter a valid URL")
    .regex(/github\.com/, "Must be a GitHub URL"),
});

export function PluginForm() {
  const [parsed, setParsed] = useState<ParsedPlugin | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [expandedComponent, setExpandedComponent] = useState<string | null>(
    null,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { url: "" },
  });

  const { execute: executeParse, isExecuting: isParsing } = useAction(
    parseGitHubPluginAction,
    {
      onSuccess: ({ data }) => {
        if (data) {
          setParsed(data);
          setEditedName(data.name);
          setEditedDescription(data.description);
          setParseError(null);
        }
      },
      onError: ({ error }) => {
        setParseError(
          error.serverError ?? "Failed to parse repository",
        );
        setParsed(null);
      },
    },
  );

  const { execute: executeCreate, isExecuting: isCreating } = useAction(
    createPluginAction,
    {
      onError: ({ error }) => {
        setPublishError(
          error.serverError ?? "Failed to publish plugin. Please try again.",
        );
      },
    },
  );

  const onParse = (values: z.infer<typeof formSchema>) => {
    setParseError(null);
    setPublishError(null);
    setParsed(null);
    executeParse({ url: values.url });
  };

  const onPublish = () => {
    if (!parsed) return;
    setPublishError(null);

    executeCreate({
      name: editedName || parsed.name,
      description: editedDescription || parsed.description,
      logo: parsed.logo ?? null,
      repository: parsed.repository,
      homepage: parsed.homepage ?? null,
      keywords: parsed.keywords,
      components: parsed.components.map((c) => ({
        type: c.type as any,
        name: c.name,
        slug: c.slug,
        description: c.description,
        content: c.content,
        metadata: c.metadata,
      })),
    });
  };

  const componentsByType = parsed
    ? Object.entries(
        parsed.components.reduce(
          (acc, c) => {
            const key = c.type;
            if (!acc[key]) acc[key] = [];
            acc[key].push(c);
            return acc;
          },
          {} as Record<string, ParsedComponent[]>,
        ),
      )
    : [];

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onParse)} className="space-y-4">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Github className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="https://github.com/you/your-plugin"
                        {...field}
                        className="border-border pl-10 placeholder:text-text-quaternary"
                        disabled={isParsing}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isParsing}
                      className="flex-shrink-0"
                    >
                      {isParsing ? (
                        <>
                          <Loader2 className="size-4 animate-spin mr-2" />
                          Scanning...
                        </>
                      ) : parsed ? (
                        "Re-scan"
                      ) : (
                        "Scan repo"
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {parseError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
          <div className="text-sm text-red-400">
            <p>{parseError}</p>
          </div>
        </div>
      )}

      {parsed && (
        <div className="space-y-5">
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">
                Name
              </label>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="border-border"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted-foreground">
                Description
              </label>
              <Input
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="border-border"
              />
            </div>
            {parsed.author_name && (
              <p className="text-xs text-muted-foreground">
                by {parsed.author_name}
              </p>
            )}
            {parsed.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {parsed.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Check className="size-3.5 text-emerald-500" />
              <p className="text-sm text-muted-foreground">
                Found {parsed.components.length}{" "}
                {parsed.components.length === 1 ? "component" : "components"}
              </p>
            </div>

            {componentsByType.map(([type, components]) => (
              <div key={type} className="space-y-1.5">
                <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary">
                  {COMPONENT_LABELS[type] ?? type} ({components.length})
                </p>
                {components.map((comp) => {
                  const isExpanded =
                    expandedComponent === `${type}:${comp.slug}`;
                  return (
                    <div
                      key={`${type}:${comp.slug}`}
                      className="overflow-hidden rounded-lg border border-border bg-card shadow-cursor"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-accent"
                        onClick={() =>
                          setExpandedComponent(
                            isExpanded ? null : `${type}:${comp.slug}`,
                          )
                        }
                      >
                        <span className="text-sm">{comp.name}</span>
                        <ChevronDown
                          className={cn(
                            "size-3.5 text-muted-foreground transition-transform",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </button>
                      {isExpanded && comp.content && (
                        <div className="border-t border-border bg-editor p-3">
                          <code className="block max-h-48 overflow-y-auto whitespace-pre-wrap text-xs leading-6 text-muted-foreground">
                            {comp.content.slice(0, 2000)}
                            {(comp.content?.length ?? 0) > 2000 && "\n..."}
                          </code>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {publishError && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
              <p className="text-sm text-red-400">{publishError}</p>
            </div>
          )}

          <Button
            onClick={onPublish}
            size="lg"
            disabled={isCreating || !editedName.trim()}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Publishing...
              </>
            ) : (
              "Publish Plugin"
            )}
          </Button>
        </div>
      )}

      {!parsed && !parseError && (
        <div className="border-t border-border pt-6">
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

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Single-plugin and multi-plugin repos are both supported.
          </p>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
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
      )}
    </div>
  );
}
