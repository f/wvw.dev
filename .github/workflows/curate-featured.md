---
on:
  schedule: daily
permissions:
  contents: read
safe-outputs:
  create-pull-request:
    title-prefix: "[featured] "
---

## Curate Daily Featured Apps

Every day, select fresh apps to feature in the World Vibe Web carousel and update `featured.json`.

### Context

World Vibe Web (wvw.dev) is a distributed app store. The file `featured.json` controls which apps appear in the homepage carousel banner. Each entry has an `id` (matching an app in `apps.json`), a `headline`, a `title`, and a `subtitle`.

The current `featured.json` looks like this:

```json
[
  {
    "id": "textream",
    "headline": "NEW APP",
    "title": "Your script, always in sight.",
    "subtitle": "Textream brings a Dynamic Island teleprompter..."
  }
]
```

### What to do

1. Read `apps.json` and get the full list of available apps
2. Read the current `featured.json` to see what's currently featured
3. Select **4 apps** for the new featured list using these criteria:
   - Pick from **different stores** (`_store` field) to ensure variety
   - **Rotate**: at least 2 of the 4 should be different from the current featured list
   - Always keep at least 1 app with very high stars (>100) as an anchor
4. For each selected app, write a compelling featured entry:
   - `headline`: A short uppercase label (2-3 words). Be creative and varied. Examples: "EDITOR'S PICK", "TRENDING", "NEW APP", "COMMUNITY FAVORITE", "MUST TRY", "TOP RATED", "HIDDEN GEM", "JUST SHIPPED", "FAN FAVORITE", "RISING STAR"
   - `title`: A catchy, punchy one-liner (5-10 words). Don't just repeat the app name. Be creative — think Apple App Store editorial voice. Examples: "Your script, always in sight.", "Screenshots, reimagined.", "The world's largest prompt collection."
   - `subtitle`: 1-2 sentences describing what makes this app special. Write it like a magazine blurb, not a README description.
5. Write the updated `featured.json` array (4 entries)
6. Create a pull request with the updated `featured.json`. It will auto-merge.

### Important rules

- The `id` field MUST exactly match an app id from `apps.json` — double check this
- Always output valid JSON
- Do not modify any other files
- Write in English
- Be editorially creative with headlines and titles — avoid repeating the same phrases
- Each of the 4 entries should have a different headline
