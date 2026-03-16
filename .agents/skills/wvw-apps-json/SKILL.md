---
name: wvw-apps-json
description: >-
  Generate an apps.json file for publishing apps on World Vibe Web (wvw.dev).
  Use when the user wants to create, generate, or update an apps.json for listing
  their apps on wvw.dev, or asks about the Appétit format, WVW distribution, or
  how to publish vibe-coded apps.
metadata:
  author: f
  version: 1.0.0
  tags: wvw, app-store, apps-json, appetit
---

# Generate apps.json for World Vibe Web

Create a valid `apps.json` file for publishing apps on [wvw.dev](https://wvw.dev) — the distributed app store for vibe-coded projects.

## Schema

The file must follow the Appétit schema. Add `"$schema": "https://wvw.dev/apps.schema.json"` for editor validation.

### Top-level structure

```json
{
  "$schema": "https://wvw.dev/apps.schema.json",
  "store": { ... },
  "categories": [ ... ],
  "apps": [ ... ]
}
```

### Store (required)

```json
"store": {
  "name": "Store Name",
  "developer": "Your Name",
  "tagline": "A short tagline.",
  "url": "https://your-site.com",
  "github": "https://github.com/yourname"
}
```

- `name` (required): Store display name
- `developer` (required): Default developer name for all apps
- `tagline`: Short tagline
- `url`: Store website
- `github`: GitHub profile or org URL

### Categories

Use ONLY these allowed category IDs. Apps with unrecognized categories will be stripped by WVW:

`macos`, `ios`, `android`, `web`, `cli`, `developer-tools`, `productivity`, `utilities`, `education`, `entertainment`, `games`, `music`, `photo-video`, `graphics-design`, `social-networking`, `finance`, `health-fitness`, `lifestyle`, `news`, `business`, `reference`, `travel`, `food-drink`, `navigation`, `sports`, `weather`, `shopping`, `books`, `medical`

```json
"categories": [
  { "id": "cli", "name": "CLI Apps" },
  { "id": "web", "name": "Web Apps" }
]
```

### Apps (required)

Each app entry:

```json
{
  "id": "my-tool",
  "name": "My Tool",
  "subtitle": "A catchy tagline under 50 chars",
  "description": "One-liner for list views and search.",
  "longDescription": "Full description for the detail page.",
  "icon": "https://raw.githubusercontent.com/user/repo/main/icon.png",
  "iconEmoji": "🔧",
  "iconStyle": { "scale": 1.3, "objectFit": "cover", "borderRadius": "22%" },
  "category": ["cli", "developer-tools"],
  "platform": "Node.js",
  "price": "Free",
  "github": "https://github.com/user/repo",
  "homepage": "https://my-tool.dev",
  "language": "TypeScript",
  "stars": 0,
  "forks": 0,
  "brew": "brew install user/tap/my-tool",
  "installCommand": "npx my-tool",
  "downloadUrl": "https://github.com/user/repo/releases/latest",
  "requirements": "Node.js 20+",
  "features": ["Feature one", "Feature two"],
  "screenshots": ["https://raw.githubusercontent.com/user/repo/main/screenshot.png"]
}
```

#### Required fields
- `id`: Unique, lowercase kebab-case. Used in URLs and deduplication.
- `name`: Display name
- `subtitle`: Short tagline for list rows. Keep under 50 chars, no trailing period.
- `description`: One-liner for search and cards
- `category`: Array of allowed category IDs. Use 2-3 categories.
- `platform`: `"macOS"`, `"Web"`, `"Node.js"`, `"CLI"`, `"Python"`, etc.
- `price`: `"Free"` or a price string like `"$9.99"`
- `github`: Full GitHub URL

#### Optional but recommended
- `longDescription`: Full description for the detail page
- `icon`: URL to PNG/SVG icon. Use raw.githubusercontent.com for GitHub-hosted icons.
- `iconEmoji`: Fallback emoji when icon is null
- `iconStyle`: Object with `scale`, `objectFit`, `borderRadius`, `bgColor`, `padding`
- `language`: Primary programming language
- `features`: Array of feature strings
- `screenshots`: Array of image/video URLs
- `brew`: Homebrew install command (triggers install modal)
- `installCommand`: Alternative install command like `npx my-tool`
- `downloadUrl`: Direct download link (shown as secondary button)
- `requirements`: System requirements string

## Icon Styling Guide

Common patterns:

```jsonc
// macOS app icon (Xcode .appiconset PNG with padding)
"iconStyle": { "scale": 1.3, "objectFit": "cover", "borderRadius": "22%" }

// SVG logo on dark background
"iconStyle": { "objectFit": "contain", "bgColor": "#000000" }

// Wide logo that needs padding
"iconStyle": { "scale": 0.9, "objectFit": "contain", "bgColor": "#000", "padding": "18%" }
```

## Workflow

1. Ask the user for their GitHub repos or app details
2. If they provide a GitHub username/org, fetch their repos to discover apps
3. Generate the `apps.json` with proper store metadata, categories, and app entries
4. For each app:
   - Use the repo description as `description`
   - Write a compelling `subtitle` (App Store editorial voice, under 50 chars, no period)
   - Detect the primary language from the repo
   - Check if the repo has a `brew` formula, `npx` command, or releases
   - Look for icon files in the repo (check `Assets.xcassets`, `public/`, `docs/`, root)
   - Look for screenshots in `docs/`, `screenshots/`, or README images
   - Pick 2-3 fitting categories from the allowed list
5. Validate the output is valid JSON matching the schema
6. Tell the user to:
   - Commit the `apps.json` to their repo
   - Open a PR to `f/wvw.dev` adding their repo to `stores.json`
   - Or use the [WVW apps.json Generator](https://findutils.com/en/tools/wvw-apps-json-generator/) web tool

## Important rules

- Stars and forks values are **overwritten** by WVW's build — don't worry about accuracy
- The `featured` array is **ignored** by WVW — don't include it
- App `id` must be globally unique across all stores
- All icon/screenshot URLs must be publicly accessible
- Always output valid JSON
