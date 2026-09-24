#!/usr/bin/env bash
# Mie Ayam Ranger — auto deploy: Git pull -> install -> build -> publish -> prune
# Pemakaian:
#   chmod +x scripts/deploy.sh
#   REPO_DIR=/home/user/mieayam WEB_ROOT=/var/www/mieayamranger ./scripts/deploy.sh
# Cron (tiap 10 menit, hanya deploy jika ada commit baru):
#   */10 * * * * REPO_DIR=... WEB_ROOT=... /path/scripts/deploy.sh >> /var/log/mieayam-deploy.log 2>&1

set -Eeuo pipefail

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
WEB_ROOT="${WEB_ROOT:-/var/www/mieayamranger}"
BRANCH="${BRANCH:-main}"
RELEASES_DIR="${RELEASES_DIR:-$WEB_ROOT/releases}"
KEEP_RELEASES="${KEEP_RELEASES:-3}"
FORCE="${FORCE:-0}"          # FORCE=1 untuk build walau tidak ada commit baru
LOCK_FILE="/tmp/mieayam-deploy.lock"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
trap 'log "GAGAL di baris $LINENO. Situs tetap memakai rilis sebelumnya."' ERR

# Cegah deploy berjalan ganda
exec 9>"$LOCK_FILE"
flock -n 9 || { log "Deploy lain sedang berjalan, keluar."; exit 0; }

cd "$REPO_DIR"
log "Repo: $REPO_DIR | Branch: $BRANCH | Web root: $WEB_ROOT"

# 1. Update dari Git
git fetch --prune origin "$BRANCH"
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")
if [[ "$LOCAL" == "$REMOTE" && "$FORCE" != "1" ]]; then
  log "Tidak ada perubahan ($LOCAL). Selesai."
  exit 0
fi
git checkout -q "$BRANCH"
git reset --hard "origin/$BRANCH"
git clean -fd -e .env
log "Update ke commit $(git rev-parse --short HEAD)"

# 2. Install dependency (pakai bun jika ada, fallback npm)
if command -v bun >/dev/null 2>&1 && [[ -f bun.lockb || -f bun.lock ]]; then
  bun install --frozen-lockfile
  BUILD_CMD="bun run build"
else
  npm ci --no-audit --no-fund
  BUILD_CMD="npm run build"
fi

# 3. Build
[[ -f .env ]] || log "PERINGATAN: .env tidak ditemukan — isi VITE_SUPABASE_* dulu."
$BUILD_CMD
[[ -f dist/index.html ]] || { log "Build tidak menghasilkan dist/index.html"; exit 1; }

# 4. Publish atomik (release baru + symlink 'current')
RELEASE="$RELEASES_DIR/$(date +%Y%m%d%H%M%S)-$(git rev-parse --short HEAD)"
mkdir -p "$RELEASE"
cp -a dist/. "$RELEASE/"
ln -sfn "$RELEASE" "$WEB_ROOT/current.tmp"
mv -Tf "$WEB_ROOT/current.tmp" "$WEB_ROOT/current"
log "Aktif: $RELEASE"

# 5. Prune
cd "$RELEASES_DIR"
ls -1dt */ 2>/dev/null | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf --
log "Rilis lama dibersihkan (simpan $KEEP_RELEASES terakhir)."
cd "$REPO_DIR"
rm -rf node_modules/.vite node_modules/.cache
if command -v bun >/dev/null 2>&1 && [[ "$BUILD_CMD" == bun* ]]; then
  bun pm cache rm >/dev/null 2>&1 || true
else
  npm prune --omit=dev >/dev/null 2>&1 || true
  npm cache verify >/dev/null 2>&1 || true
fi
git gc --auto --prune=now -q || true

log "Deploy selesai ✅"
