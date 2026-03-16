#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const ALLOWED_CATEGORIES = [
  "macos", "ios", "android", "web", "cli", "developer-tools", "productivity", "utilities",
  "education", "entertainment", "games", "music", "photo-video",
  "graphics-design", "social-networking", "finance", "health-fitness",
  "lifestyle", "news", "business", "reference", "travel", "food-drink",
  "navigation", "sports", "weather", "shopping", "books", "medical",
];

const REQUIRED_APP_FIELDS = ["id", "name", "subtitle", "description", "category", "platform", "price", "github"];

const server = new Server(
  { name: "wvw-apps-json", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "wvw://schema",
      name: "WVW apps.json Schema",
      description: "The full JSON Schema for apps.json files accepted by World Vibe Web",
      mimeType: "application/json",
    },
    {
      uri: "wvw://categories",
      name: "Allowed Categories",
      description: "List of category IDs accepted by WVW",
      mimeType: "application/json",
    },
    {
      uri: "wvw://guide",
      name: "Distribution Guide",
      description: "How to publish apps on wvw.dev",
      mimeType: "text/plain",
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === "wvw://categories") {
    return {
      contents: [{
        uri,
        mimeType: "application/json",
        text: JSON.stringify(ALLOWED_CATEGORIES, null, 2),
      }],
    };
  }

  if (uri === "wvw://schema") {
    try {
      const resp = await fetch("https://wvw.dev/apps.schema.json");
      const schema = await resp.text();
      return { contents: [{ uri, mimeType: "application/json", text: schema }] };
    } catch {
      return { contents: [{ uri, mimeType: "text/plain", text: "Failed to fetch schema" }] };
    }
  }

  if (uri === "wvw://guide") {
    return {
      contents: [{
        uri,
        mimeType: "text/plain",
        text: [
          "Publishing Apps on World Vibe Web (wvw.dev)",
          "",
          "1. Create an apps.json in your repo root",
          "2. Use the schema: https://wvw.dev/apps.schema.json",
          "3. Open a PR to https://github.com/f/wvw.dev adding your repo to stores.json",
          "4. Your apps appear on wvw.dev within 6 hours after merge",
          "",
          "Use the generate_apps_json tool to create the file, or validate_apps_json to check an existing one.",
          "",
          "Web generator: https://findutils.com/en/tools/wvw-apps-json-generator/",
        ].join("\n"),
      }],
    };
  }

  throw new Error(`Unknown resource: ${uri}`);
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "generate_app_entry",
      description:
        "Generate a single app entry for an apps.json file from a GitHub repo URL. " +
        "Fetches repo metadata and returns a valid app object ready to include in the apps array.",
      inputSchema: {
        type: "object",
        properties: {
          github_url: {
            type: "string",
            description: "GitHub repository URL (e.g. https://github.com/user/repo)",
          },
          platform: {
            type: "string",
            description: "App platform: macOS, Web, CLI, Node.js, Python, etc.",
          },
          categories: {
            type: "array",
            items: { type: "string" },
            description: `Category IDs (2-3 recommended). Allowed: ${ALLOWED_CATEGORIES.join(", ")}`,
          },
          subtitle: {
            type: "string",
            description: "Short catchy tagline under 50 chars, no trailing period",
          },
          brew: {
            type: "string",
            description: "Homebrew install command (optional, e.g. brew install user/tap/app)",
          },
          install_command: {
            type: "string",
            description: "Install command (optional, e.g. npx my-tool)",
          },
        },
        required: ["github_url", "platform", "categories"],
      },
    },
    {
      name: "validate_apps_json",
      description:
        "Validate an apps.json file content against the WVW schema. " +
        "Checks required fields, category validity, and common issues.",
      inputSchema: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "The full apps.json file content as a string",
          },
        },
        required: ["content"],
      },
    },
    {
      name: "get_allowed_categories",
      description: "Returns the list of category IDs accepted by World Vibe Web.",
      inputSchema: { type: "object", properties: {} },
    },
    {
      name: "generate_store_metadata",
      description:
        "Generate the store metadata section for an apps.json file from a GitHub username or org.",
      inputSchema: {
        type: "object",
        properties: {
          github_username: {
            type: "string",
            description: "GitHub username or organization name",
          },
          store_name: {
            type: "string",
            description: "Display name for the store",
          },
          tagline: {
            type: "string",
            description: "Short tagline for the store",
          },
        },
        required: ["github_username"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_allowed_categories") {
    return {
      content: [{
        type: "text",
        text: JSON.stringify(
          ALLOWED_CATEGORIES.map((id) => ({ id, example: `"category": ["${id}"]` })),
          null, 2
        ),
      }],
    };
  }

  if (name === "generate_store_metadata") {
    const username = args.github_username;
    let name = args.store_name || username;
    let bio = args.tagline || "";

    try {
      const resp = await fetch(`https://api.github.com/users/${username}`);
      if (resp.ok) {
        const user = await resp.json();
        name = args.store_name || user.name || username;
        bio = args.tagline || user.bio || "";
      }
    } catch {}

    const store = {
      name,
      developer: name,
      tagline: bio,
      url: `https://github.com/${username}`,
      github: `https://github.com/${username}`,
    };

    return {
      content: [{
        type: "text",
        text: JSON.stringify({ store, categories: [], apps: [] }, null, 2),
      }],
    };
  }

  if (name === "generate_app_entry") {
    const url = args.github_url.replace(/\/$/, "");
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return { content: [{ type: "text", text: "Error: Invalid GitHub URL" }] };
    }

    const [, owner, repo] = match;
    let repoData = {};

    try {
      const resp = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (resp.ok) repoData = await resp.json();
    } catch {}

    const invalidCats = (args.categories || []).filter((c) => !ALLOWED_CATEGORIES.includes(c));
    const validCats = (args.categories || []).filter((c) => ALLOWED_CATEGORIES.includes(c));

    const entry = {
      id: repo.toLowerCase(),
      name: repoData.name || repo,
      subtitle: args.subtitle || repoData.description || "A vibe-coded app",
      description: repoData.description || "",
      longDescription: repoData.description || "",
      icon: `https://raw.githubusercontent.com/${owner}/${repo}/${repoData.default_branch || "main"}/icon.png`,
      iconEmoji: "📦",
      iconStyle: {},
      category: validCats.length > 0 ? validCats : ["utilities"],
      platform: args.platform,
      price: "Free",
      github: url,
      homepage: repoData.homepage || null,
      language: repoData.language || "Unknown",
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      requirements: "",
      features: [],
      screenshots: [],
    };

    if (args.brew) entry.brew = args.brew;
    if (args.install_command) entry.installCommand = args.install_command;
    if (repoData.has_releases) {
      entry.downloadUrl = `https://github.com/${owner}/${repo}/releases/latest`;
    }

    let warnings = [];
    if (invalidCats.length > 0) {
      warnings.push(`Invalid categories removed: ${invalidCats.join(", ")}`);
    }
    if (!args.subtitle) {
      warnings.push("No subtitle provided — using repo description. Consider writing a catchy tagline under 50 chars.");
    }

    const result = {
      app: entry,
      warnings,
      next_steps: [
        "Review and customize the icon URL — check if icon.png exists in your repo",
        "Add screenshots URLs to the screenshots array",
        "Add features as an array of strings",
        "Set requirements (e.g. 'macOS 15 or later', 'Node.js 20+')",
        "Add iconStyle if needed (scale, borderRadius, bgColor)",
        "Commit apps.json to your repo root",
        `Open a PR to https://github.com/f/wvw.dev adding "${owner}/${repo}" to stores.json`,
      ],
    };

    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }

  if (name === "validate_apps_json") {
    let data;
    try {
      data = JSON.parse(args.content);
    } catch (e) {
      return { content: [{ type: "text", text: `Error: Invalid JSON — ${e.message}` }] };
    }

    const issues = [];
    const suggestions = [];

    if (!data.store) issues.push("Missing 'store' object");
    else {
      if (!data.store.name) issues.push("Missing store.name");
      if (!data.store.developer) issues.push("Missing store.developer");
      if (!data.store.tagline) suggestions.push("Add a store.tagline");
    }

    if (!data.apps || !Array.isArray(data.apps)) {
      issues.push("Missing or invalid 'apps' array");
    } else {
      data.apps.forEach((app, i) => {
        const prefix = `apps[${i}] (${app.name || app.id || "?"})`;
        REQUIRED_APP_FIELDS.forEach((f) => {
          if (!app[f]) issues.push(`${prefix}: missing required field '${f}'`);
        });
        if (Array.isArray(app.category)) {
          const invalid = app.category.filter((c) => !ALLOWED_CATEGORIES.includes(c));
          if (invalid.length) issues.push(`${prefix}: invalid categories: ${invalid.join(", ")}`);
        }
        if (app.subtitle && app.subtitle.length > 60) {
          suggestions.push(`${prefix}: subtitle is long (${app.subtitle.length} chars), consider shortening`);
        }
        if (app.subtitle && app.subtitle.endsWith(".")) {
          suggestions.push(`${prefix}: subtitle shouldn't end with a period`);
        }
        if (!app.icon && !app.iconEmoji) {
          suggestions.push(`${prefix}: add an icon URL or iconEmoji`);
        }
        if (!app.screenshots || app.screenshots.length === 0) {
          suggestions.push(`${prefix}: add screenshots for better visibility`);
        }
      });
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          valid: issues.length === 0,
          issues,
          suggestions,
          app_count: data.apps ? data.apps.length : 0,
        }, null, 2),
      }],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

const transport = new StdioServerTransport();
await server.connect(transport);
