<p align="center">
  <img src="logo.png" width="128" height="128" alt="World Vibe Web">
</p>

<h1 align="center">World Vibe Web</h1>

<p align="center">
  <em>The distributed app store for vibe-coded projects.</em><br>
  Aggregates apps from multiple GitHub repos into one browsable catalog.
</p>

<p align="center">
  <a href="https://wvw.dev">Live</a> ·
  <a href="#how-it-works">How It Works</a> ·
  <a href="#add-your-store">Add Your Store</a>
</p>

---

World Vibe Web is a distributed app store. Anyone with an [Appétit](https://github.com/f/appetit)-compatible `apps.json` in their GitHub repo can be listed. A GitHub Action fetches all registered repos, merges their apps into a single unified catalog, and deploys it as a static site.

## How It Works

```
stores.json         →  build.sh         →  apps.json      →  static site
(repo paths or         (fetches each        (merged from       (same Appétit UI
 direct URLs to         store's              all sources)       reading local
 apps.json files)       apps.json)                              apps.json)
```

1. `stores.json` lists store sources — GitHub repo paths or direct URLs to `apps.json` files
2. A GitHub Action runs `build.sh` every 6 hours
3. `build.sh` fetches each repo's `apps.json`, merges apps/categories/featured, deduplicates, and writes a unified `apps.json`
4. The static site (same Appétit UI) reads the local `apps.json` and renders everything

## Add Your Store

1. Create an `apps.json` in your repo following the [Appétit format](https://github.com/f/appetit)
2. Open a PR adding your store to `stores.json` — either a GitHub repo path or a direct URL:

```json
[
  "f/appetit",
  "yourname/your-repo",
  "https://example.com/apps.json"
]
```

3. Once merged, your apps appear on wvw.dev within 6 hours (or trigger a manual build)

## Run Locally

```bash
git clone https://github.com/f/wvw.dev.git
cd wvw.dev
./build.sh
python3 -m http.server 8080
```

## File Structure

```
├── index.html              Static site shell
├── style.css               Appétit UI styles
├── app.js                  Appétit UI logic
├── logo.png                WVW favicon/logo
├── stores.json             List of store sources (edit this)
├── build.sh                Fetches & merges all apps.json
├── apps.json               Generated — do not edit manually
├── CNAME                   Custom domain
├── .nojekyll               Bypass Jekyll
└── .github/workflows/
    └── build.yml           Scheduled build action
```

## License

MIT
