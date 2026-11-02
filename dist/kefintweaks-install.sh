#!/usr/bin/env bash
# KefinTweaks for Jellyfin 12 (jf12 fork): one-line installer.
#   curl -fsSL <release>/install.sh | bash -s -- --container jellyfin [--url http://localhost:8096] [--api-key KEY]     (Jellyfin in docker)
#   curl -fsSL <release>/install.sh | sudo bash -s -- --web-dir /usr/share/jellyfin/web [--url ...] [--api-key KEY]     (Jellyfin installed from a package)
# What it does, in order, and prints as it goes:
#   1. downloads the release zip and checks its sha256
#   2. backs up the JavaScript Injector configuration (to ./kefintweaks-backup-<time>.json with --api-key, and the plugin's XML file when it can read it)
#   3. copies the files into Jellyfin's web folder: <web>/kefin/<version>/  (Jellyfin serves them at /web/kefin/<version>/, same origin, no CDN)
#   4. with --api-key (Dashboard > API Keys): writes the two JavaScript Injector entries KefinTweaks-Config and KefinTweaks-injector (an existing
#      KefinTweaks-Config keeps its settings, only its kefinTweaksRoot changes). Without it: saves both entries next to the backup to paste by hand.
#   5. checks that Jellyfin serves <url>/web/kefin/<version>/injector.js
# Needs: bash, curl, unzip or python3, tar; docker for --container; python3 for --api-key. The JavaScript Injector plugin must be installed in Jellyfin.
# A docker container re-created from a new image loses the files unless <web>/kefin is a bind mount (README): run this again after an image update.
# Options: --version X (default: the one this script was released with)  --zip FILE (install from a local zip)  --dry-run  --uninstall (removes <web>/kefin/<version>)
set -euo pipefail
# all in one function: bash reads a piped script as it runs, so nothing runs before the whole script has arrived
main() {
VERSION="0.5.0-jf12.1"                       # filled in by tools/build-release.sh
RELEASES="https://github.com/scotthowson/kefintweaks-jf12-releases/releases/download"                     # .../releases/download
ZIP_SHA256="3166c5459ba5a968492df9d982fc9aee8476d7c6696eba862223674123937325"
CTR=""; WEB=""; URL="http://localhost:8096"; KEY="${JF_API_KEY:-}"; ZIP=""; DRY=0; UNINSTALL=0
say() { printf '%s\n' "kefintweaks: $*"; }
die() { printf '%s\n' "kefintweaks: ERROR: $*" >&2; exit 1; }
while [ $# -gt 0 ]; do
  case "$1" in
    --container) CTR=$2; shift;; --web-dir) WEB=$2; shift;; --url) URL=${2%/}; shift;; --api-key) KEY=$2; shift;;
    --version) [ "$2" = "$VERSION" ] || ZIP_SHA256=""; VERSION=$2; shift;; --zip) ZIP=$2; ZIP_SHA256=""; shift;;
    --dry-run) DRY=1;; --uninstall) UNINSTALL=1;;
    -h|--help) sed -n '2,16p' "$0" 2>/dev/null || true; exit 0;;
    *) die "unknown option $1 (see --help)";;
  esac; shift
done
URL=${URL%/web}
ZIP_URL="$RELEASES/v$VERSION/kefintweaks-jf12-$VERSION.zip"
[ -n "$CTR" ] || [ -n "$WEB" ] || die "say where Jellyfin is: --container <docker container name> or --web-dir <jellyfin web folder>"
case "$VERSION" in *[!A-Za-z0-9._-]*|'') die "bad version '$VERSION'";; esac

# run a command where Jellyfin is (inside the container, or here)
on() { if [ -n "$CTR" ]; then docker exec "$CTR" sh -c "$1" </dev/null; else sh -c "$1" </dev/null; fi; }
put() { if [ -n "$CTR" ]; then docker exec -i "$CTR" sh -c "$1"; else sh -c "$1"; fi; }     # with stdin (the tar stream)
if [ -n "$CTR" ]; then
  docker inspect "$CTR" >/dev/null 2>&1 || die "no docker container named '$CTR' (docker ps)"
  [ -n "$WEB" ] || WEB=$(on 'for d in /jellyfin/jellyfin-web /usr/share/jellyfin/web /usr/lib/jellyfin/bin/jellyfin-web; do [ -f "$d/index.html" ] && { echo "$d"; break; }; done')
fi
[ -n "$WEB" ] || die "could not find Jellyfin's web folder: pass --web-dir"
on "[ -f '$WEB/index.html' ]" || die "$WEB has no index.html: not Jellyfin's web folder"
DEST="$WEB/kefin/$VERSION"; ROOT="/web/kefin/$VERSION/"
say "Jellyfin web folder: ${CTR:+container $CTR: }$WEB"
say "version $VERSION -> $DEST   (kefinTweaksRoot: $ROOT)"

if [ $UNINSTALL = 1 ]; then
  say "removing $DEST (delete the two JavaScript Injector entries KefinTweaks-Config and KefinTweaks-injector yourself)"
  [ $DRY = 1 ] || on "rm -rf '$DEST'"; exit 0
fi

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
# 1. the zip
if [ -z "$ZIP" ]; then
  say "downloading $ZIP_URL"
  curl -fsSL -o "$TMP/kt.zip" "$ZIP_URL" || die "download failed"
  ZIP="$TMP/kt.zip"
fi
if [ -n "$ZIP_SHA256" ]; then
  got=$(sha256sum "$ZIP" | cut -d' ' -f1); [ "$got" = "$ZIP_SHA256" ] || die "sha256 mismatch: $got (expected $ZIP_SHA256)"
  say "sha256 ok"
fi
mkdir -p "$TMP/files"
if command -v unzip >/dev/null; then unzip -q "$ZIP" -d "$TMP/files"; else python3 -c 'import sys,zipfile; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])' "$ZIP" "$TMP/files"; fi
[ -f "$TMP/files/injector.js" ] || die "the zip has no injector.js"
say "$(find "$TMP/files" -type f | wc -l) files in the release"

# 2. backups
STAMP=$(date +%Y%m%d-%H%M%S); BK="kefintweaks-backup-$STAMP"
if [ $DRY = 0 ]; then
  for f in /config/plugins/configurations/Jellyfin.Plugin.JavaScriptInjector.xml /var/lib/jellyfin/plugins/configurations/Jellyfin.Plugin.JavaScriptInjector.xml /etc/jellyfin/plugins/configurations/Jellyfin.Plugin.JavaScriptInjector.xml; do
    if on "[ -r '$f' ]" 2>/dev/null; then on "cat '$f'" > "$BK.xml"; say "backed up $f -> $PWD/$BK.xml ($(wc -c < "$BK.xml") bytes)"; break; fi
  done
  [ -f "$BK.xml" ] || say "no JavaScript Injector configuration file found to back up (plugin not configured yet, or another config folder)"
fi
API() { curl -fsS -H "Authorization: MediaBrowser Token=\"$KEY\"" -H 'Content-Type: application/json' "$@"; }
PLUGIN_ID=""
if [ -n "$KEY" ]; then
  command -v python3 >/dev/null || die "--api-key needs python3"
  PLUGIN_ID=$(API "$URL/Plugins" | python3 -c 'import sys,json; print(next((p["Id"] for p in json.load(sys.stdin) if p.get("Name")=="JavaScript Injector"),""))' 2>/dev/null) || die "could not list plugins at $URL (is --url right, is the key an API key?)"
  [ -n "$PLUGIN_ID" ] || die "the JavaScript Injector plugin is not installed (Dashboard > Plugins > Catalog)"
  API "$URL/Plugins/$PLUGIN_ID/Configuration" > "$TMP/jsi.json"
  [ $DRY = 1 ] || { cp "$TMP/jsi.json" "$BK.json"; say "backed up the JavaScript Injector configuration -> $PWD/$BK.json"; }
fi

# 3. files
if [ $DRY = 1 ]; then say "dry run: would copy the files to $DEST"; else
  tar -C "$TMP/files" -cf - . | put "mkdir -p '$DEST' && tar -C '$DEST' -xf - && chmod -R a+rX '$WEB/kefin'"
  say "copied to $DEST"
fi

# 4. the two entries
CONFIG_SCRIPT=$(sed "s#https://YOUR-HOST/kefin/COMMIT-SHA/#$ROOT#" "$TMP/files/docs/jf12/config-entry.example.js")
BOOT_SCRIPT=$(cat "$TMP/files/docs/jf12/injector-entry.js")
if [ -n "$KEY" ]; then
  CONFIG_SCRIPT="$CONFIG_SCRIPT" BOOT_SCRIPT="$BOOT_SCRIPT" ROOT="$ROOT" python3 - "$TMP/jsi.json" > "$TMP/new.json" <<'PY'
import json, os, re, sys
cfg = json.load(open(sys.argv[1]))
entries = cfg.setdefault("CustomJavaScripts", [])
byname = {e.get("Name"): e for e in entries}
root = os.environ["ROOT"]
if "KefinTweaks-Config" in byname:            # keep the settings, move the root
    e = byname["KefinTweaks-Config"]
    e["Script"] = re.sub(r'("kefinTweaksRoot"\s*:\s*")[^"]*(")', lambda m: m.group(1) + root + m.group(2), e["Script"], count=1)
    e.update(Enabled=True, RequiresAuthentication=False)
else:
    entries.append({"Name": "KefinTweaks-Config", "Script": os.environ["CONFIG_SCRIPT"], "Enabled": True, "RequiresAuthentication": False})
if "KefinTweaks-injector" in byname:
    byname["KefinTweaks-injector"].update(Script=os.environ["BOOT_SCRIPT"], Enabled=True, RequiresAuthentication=False)
else:
    entries.append({"Name": "KefinTweaks-injector", "Script": os.environ["BOOT_SCRIPT"], "Enabled": True, "RequiresAuthentication": False})
# the Config entry must come before the injector entry
names = [e.get("Name") for e in entries]
if names.index("KefinTweaks-Config") > names.index("KefinTweaks-injector"):
    c = entries.pop(names.index("KefinTweaks-Config")); entries.insert(names.index("KefinTweaks-injector"), c)
json.dump(cfg, sys.stdout)
PY
  if [ $DRY = 1 ]; then say "dry run: would write the entries KefinTweaks-Config and KefinTweaks-injector"; else
    API -X POST --data-binary @"$TMP/new.json" "$URL/Plugins/$PLUGIN_ID/Configuration" >/dev/null || die "writing the JavaScript Injector configuration failed (the backup is $PWD/$BK.json)"
    say "wrote the JavaScript Injector entries KefinTweaks-Config (kefinTweaksRoot $ROOT) and KefinTweaks-injector"
  fi
else
  if [ $DRY = 0 ]; then
    printf '%s\n' "$CONFIG_SCRIPT" > "$BK-KefinTweaks-Config.js"; printf '%s\n' "$BOOT_SCRIPT" > "$BK-KefinTweaks-injector.js"
  fi
  say "no --api-key: add two scripts in Dashboard > Plugins > JavaScript Injector, in this order, both Enabled with 'Requires authentication' OFF:"
  say "  KefinTweaks-Config   = $PWD/$BK-KefinTweaks-Config.js   (already have one? just change its kefinTweaksRoot to $ROOT)"
  say "  KefinTweaks-injector = $PWD/$BK-KefinTweaks-injector.js"
fi

# 5. served?
if [ $DRY = 0 ]; then
  code=$(curl -s -o /dev/null -w '%{http_code}' "$URL/web/kefin/$VERSION/injector.js" || true)
  if [ "$code" = 200 ]; then say "Jellyfin serves $URL/web/kefin/$VERSION/injector.js (200)"; else say "WARNING: $URL/web/kefin/$VERSION/injector.js answered $code (is --url the address of this Jellyfin?)"; fi
fi
say "done. Reload the Jellyfin web page; administrators find the settings in the user menu > KefinTweaks."
}
main "$@"
