#!/usr/bin/env bash
set -euo pipefail

APPS_FILE="apps.json"
ICONS_DIR="assets/icons"
SHOWCASE_DIR="assets/showcase"
ICONS_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --icons-only) ICONS_ONLY=true ;;
  esac
done

if ! command -v jq &>/dev/null; then
  echo "Error: jq is required."
  exit 1
fi

if [ ! -f "$APPS_FILE" ]; then
  echo "Error: $APPS_FILE not found. Run build.sh first."
  exit 1
fi

mkdir -p "$ICONS_DIR" "$SHOWCASE_DIR"

# Use magick if available, fall back to convert
if command -v magick &>/dev/null; then
  IMG_CMD="magick"
elif command -v convert &>/dev/null; then
  IMG_CMD="convert"
else
  echo "Error: ImageMagick not found (neither magick nor convert)."
  exit 1
fi

REPO_BASE="https://raw.githubusercontent.com/f/wvw.dev/master"
OUR_ICON_PREFIX="${REPO_BASE}/${ICONS_DIR}/"

# Owner cleanup happens after needs_icon is defined (below)
removed=0

# --- Check icon quality and generate replacements ---
echo ""
echo "=== Checking app icons ==="

needs_icon() {
  local icon_url="$1"
  if [ -z "$icon_url" ] || [ "$icon_url" = "null" ]; then
    return 0
  fi
  local tmp="/tmp/wvw-icon-check-$$.tmp"
  if ! curl -sf --max-time 10 -o "$tmp" "$icon_url" 2>/dev/null; then
    rm -f "$tmp"
    return 0
  fi
  local dims
  dims=$($IMG_CMD identify -format "%w %h" "$tmp" 2>/dev/null) || { rm -f "$tmp"; return 0; }
  rm -f "$tmp"
  local w h
  w=$(echo "$dims" | awk '{print $1}')
  h=$(echo "$dims" | awk '{print $2}')
  if [ -z "$w" ] || [ -z "$h" ] || [ "$w" -eq 0 ] || [ "$h" -eq 0 ]; then
    return 0
  fi
  local ratio
  if [ "$w" -gt "$h" ]; then
    ratio=$(( (w * 100) / h ))
  else
    ratio=$(( (h * 100) / w ))
  fi
  # Not square if ratio > 1.15 (15% tolerance)
  if [ "$ratio" -gt 115 ]; then
    return 0
  fi
  return 1
}

total_apps=$(jq '.apps | length' "$APPS_FILE")
echo "Checking $total_apps apps..."

icon_count=0
while IFS= read -r app; do
  [ -z "$app" ] && continue
  app_id=$(echo "$app" | jq -r '.id')
  app_name=$(echo "$app" | jq -r '.name')
  app_icon=$(echo "$app" | jq -r '.icon // empty')
  app_subtitle=$(echo "$app" | jq -r '.subtitle // ""')
  app_category=$(echo "$app" | jq -r '(.category // [])[0] // "utilities"')
  app_platform=$(echo "$app" | jq -r '.platform // "App"')

  icon_file="$ICONS_DIR/${app_id}.jpg"

  if [ -f "$icon_file" ]; then
    echo "  $app_name — already cached"
    continue
  fi

  if ! needs_icon "$app_icon"; then
    continue
  fi

  if [ -z "${FAL_AI_KEY:-}" ]; then
    echo "  $app_name — SKIPPED (no FAL_AI_KEY)"
    continue
  fi

  echo -n "  $app_name — generating... "

  prompt="A square app icon that fills the entire canvas edge-to-edge with ZERO padding, ZERO margin, ZERO border, NO empty space around the edges. The icon for \"${app_name}\" — ${app_subtitle}. Category: ${app_category}. A bold symbolic graphic on a solid or gradient color background that extends to every pixel of the image boundary. Style: iOS/macOS app icon, vibrant colors, simple centered symbol. No text, no letters, no words. The background color must touch all four edges completely."

  response=$(curl -s --max-time 60 -X POST "https://fal.run/fal-ai/nano-banana" \
    -H "Authorization: Key ${FAL_AI_KEY}" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg p "$prompt" '{
      prompt: $p,
      image_size: "square",
      num_images: 1
    }')" 2>/dev/null) || response=""

  img_url=$(echo "$response" | jq -r '.images[0].url // empty' 2>/dev/null) || img_url=""

  if [ -n "$img_url" ]; then
    if curl -sL "$img_url" -o "${icon_file}.tmp"; then
      if $IMG_CMD "${icon_file}.tmp" -fuzz 5% -trim +repage -resize 512x512! -quality 85 "$icon_file" 2>/dev/null; then
        echo "OK"
        icon_count=$((icon_count + 1))
      else
        echo "CONVERT FAILED"
      fi
    else
      echo "DOWNLOAD FAILED"
    fi
    rm -f "${icon_file}.tmp"
  else
    echo "API FAILED"
  fi
done < <(jq -c '.apps[]' "$APPS_FILE")

echo "Generated $icon_count new icons."

# --- Remove generated icons for apps that now have a good square icon ---
echo ""
echo "=== Cleaning up superseded generated icons ==="

for icon_file in "$ICONS_DIR"/*.jpg; do
  [ -f "$icon_file" ] || continue
  app_id=$(basename "$icon_file" .jpg)
  app_icon=$(jq -r --arg id "$app_id" '.apps[] | select(.id == $id) | .icon // empty' "$APPS_FILE" | head -1)

  if [ -n "$app_icon" ] && ! needs_icon "$app_icon"; then
    echo "  $app_id — owner now has a good icon, removing generated"
    jq --arg id "$app_id" '
      .apps = [.apps[] | if .id == $id then del(._generatedIcon) else . end]
    ' "$APPS_FILE" > "${APPS_FILE}.tmp" && mv "${APPS_FILE}.tmp" "$APPS_FILE"
    rm -f "$icon_file"
    removed=$((removed + 1))
  fi
done
echo "Removed $removed superseded generated icons."

# --- Update apps.json with _generatedIcon field ---
echo ""
echo "=== Updating apps.json with generated icon URLs ==="

updated=0
for icon_file in "$ICONS_DIR"/*.jpg; do
  [ -f "$icon_file" ] || continue
  app_id=$(basename "$icon_file" .jpg)
  icon_url="${OUR_ICON_PREFIX}${app_id}.jpg"

  jq --arg id "$app_id" --arg url "$icon_url" '
    .apps = [.apps[] | if .id == $id then ._generatedIcon = $url else . end]
  ' "$APPS_FILE" > "${APPS_FILE}.tmp" && mv "${APPS_FILE}.tmp" "$APPS_FILE"
  echo "  $app_id — _generatedIcon set"
  updated=$((updated + 1))
done

echo "Updated $updated generated icon URLs."

# --- Cache showcase images (skip if --icons-only) ---
if [ "$ICONS_ONLY" = true ]; then
  echo ""
  echo "Skipping showcase caching (--icons-only mode)."
  echo "Done."
  exit 0
fi

echo ""
echo "=== Caching showcase images ==="

if [ ! -f "showcase.json" ]; then
  echo "No showcase.json found, skipping."
else
  showcase_count=0
  while IFS= read -r pick; do
    [ -z "$pick" ] && continue
    app_id=$(echo "$pick" | jq -r '.id')
    img_url=$(echo "$pick" | jq -r '.showcase_image // empty')

    [ -z "$img_url" ] && continue
    echo "$img_url" | grep -q "^${REPO_BASE}" && continue

    cache_file="$SHOWCASE_DIR/${app_id}.jpg"

    if [ -f "$cache_file" ]; then
      echo "  $app_id — already cached"
      continue
    fi

    echo -n "  $app_id — downloading... "
    if curl -sL "$img_url" -o "${cache_file}.tmp" 2>/dev/null; then
      $IMG_CMD "${cache_file}.tmp" -quality 80 "$cache_file" 2>/dev/null && \
      rm -f "${cache_file}.tmp" && \
      echo "OK ($(du -h "$cache_file" | awk '{print $1}'))" && \
      showcase_count=$((showcase_count + 1))
    else
      rm -f "${cache_file}.tmp"
      echo "FAILED"
    fi
  done < <(jq -c '.picks[]' showcase.json)

  echo "Cached $showcase_count new showcase images."
fi

# --- Update showcase.json with cached image URLs ---
for cache_file in "$SHOWCASE_DIR"/*.jpg; do
  [ -f "$cache_file" ] || continue
  app_id=$(basename "$cache_file" .jpg)
  cache_url="${REPO_BASE}/${SHOWCASE_DIR}/${app_id}.jpg"

  if [ -f "showcase.json" ]; then
    jq --arg id "$app_id" --arg url "$cache_url" '
      .picks = [.picks[] | if .id == $id then .showcase_image = $url else . end] |
      .highlights = [.highlights[] | if .id == $id then .showcase_image = $url else . end]
    ' showcase.json > showcase.json.tmp && mv showcase.json.tmp showcase.json
  fi
done

echo ""
echo "Done."
