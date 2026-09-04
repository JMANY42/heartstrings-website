#!/usr/bin/env bash
#
# Copy everything gitignored-but-required from the main checkout into a Claude
# worktree, so the worktree can be run and tested before merging.
#
#   ./scripts/setup-worktree.sh                 # set up the worktree you're in
#   ./scripts/setup-worktree.sh gallery-bleed   # set up .claude/worktrees/gallery-bleed
#   ./scripts/setup-worktree.sh /path/to/wt     # set up an arbitrary worktree
#
# Options:
#   --force     overwrite items that already exist in the worktree
#   --copy      force real (deep) copies instead of reflink/hardlink clones
#   --symlink   symlink node_modules back to the main checkout (fastest, but a
#               `npm install` in the worktree then mutates the main checkout)
#   --list      list available worktrees and exit
#
set -euo pipefail

FORCE=0
MODE=clone   # clone | copy | symlink
TARGET=""

# print the comment block at the top of this file, minus the shebang
usage() { awk 'NR>1 && /^#/ { sub(/^# ?/, ""); print; next } NR>1 { exit }' "$0"; }

while [ $# -gt 0 ]; do
  case "$1" in
    --force)   FORCE=1 ;;
    --copy)    MODE=copy ;;
    --symlink) MODE=symlink ;;
    --list)    MODE=list ;;
    -h|--help) usage; exit 0 ;;
    -*)        echo "unknown option: $1" >&2; usage >&2; exit 2 ;;
    *)
      [ -n "$TARGET" ] && { echo "too many arguments" >&2; exit 2; }
      TARGET="$1" ;;
  esac
  shift
done

# --- locate the main checkout ------------------------------------------------
# .git/worktrees/<name> lives inside the main checkout's .git dir, so the common
# dir's parent is the main working tree regardless of where we were invoked.
git rev-parse --git-common-dir >/dev/null 2>&1 || {
  echo "error: not inside a git repository" >&2; exit 1; }
COMMON_DIR="$(cd "$(git rev-parse --git-common-dir)" && pwd)"
MAIN="$(dirname "$COMMON_DIR")"
WORKTREE_ROOT="$MAIN/.claude/worktrees"

if [ "$MODE" = list ]; then
  echo "worktrees of $MAIN:"
  git -C "$MAIN" worktree list | tail -n +2
  exit 0
fi

# --- resolve the destination worktree ----------------------------------------
if [ -z "$TARGET" ]; then
  DEST="$(git rev-parse --show-toplevel)"
  if [ "$DEST" = "$MAIN" ]; then
    echo "error: run this from inside a worktree, or pass a worktree name." >&2
    echo >&2
    git -C "$MAIN" worktree list | tail -n +2 >&2
    exit 1
  fi
elif [ -d "$TARGET" ]; then
  DEST="$(cd "$TARGET" && pwd)"
elif [ -d "$WORKTREE_ROOT/$TARGET" ]; then
  DEST="$WORKTREE_ROOT/$TARGET"
else
  echo "error: no such worktree: $TARGET" >&2
  echo >&2
  git -C "$MAIN" worktree list | tail -n +2 >&2
  exit 1
fi

[ "$DEST" != "$MAIN" ] || { echo "error: refusing to target the main checkout" >&2; exit 1; }

echo "source: $MAIN"
echo "target: $DEST"

# --- copy helpers -------------------------------------------------------------
# A partly-written destination is worse than none: it looks "already present" on
# the next run. Clean up whatever we were mid-way through on any failure.
IN_PROGRESS=""
cleanup() {
  local status=$?
  [ -n "$IN_PROGRESS" ] && rm -rf "$IN_PROGRESS"
  exit $status
}
trap cleanup EXIT

# Decide once how to clone big trees, by probing with a single small file rather
# than discovering it 226MB into a copy: a copy-on-write reflink (instant, fully
# isolated) if the filesystem supports it, else a hardlink clone (instant, and
# isolated as long as tools replace files rather than edit in place — npm and
# vite both do), else a plain deep copy.
CLONE_OPT=""
CLONE_DESC="deep copy"
detect_clone_mode() {
  case "$MODE" in
    symlink) CLONE_DESC="symlink"; return ;;
    copy)    CLONE_DESC="deep copy"; return ;;
  esac
  local probe_src="$MAIN/.gitignore" probe_dst="$DEST/.clone-probe.$$"
  [ -f "$probe_src" ] || return
  if cp -a --reflink=always "$probe_src" "$probe_dst" 2>/dev/null; then
    CLONE_OPT="--reflink=always"; CLONE_DESC="reflink clone"
  elif rm -f "$probe_dst" && cp -al "$probe_src" "$probe_dst" 2>/dev/null; then
    CLONE_OPT="-l"; CLONE_DESC="hardlink clone"
  fi
  rm -f "$probe_dst"
}

clone_dir() {
  local src="$1" dst="$2"
  if [ "$MODE" = symlink ]; then
    ln -s "$src" "$dst"
  elif [ -n "$CLONE_OPT" ]; then
    cp -a $CLONE_OPT "$src" "$dst"
  else
    cp -a "$src" "$dst"
  fi
  echo "     ($CLONE_DESC)"
}

detect_clone_mode
echo "method: $CLONE_DESC (for node_modules)"
echo

copied=0 skipped=0 missing=0

# kind: link = big regenerable tree, ok to clone; real = needs its own copy
take() {
  local kind="$1" rel="$2"
  local src="$MAIN/$rel" dst="$DEST/$rel"

  if [ ! -e "$src" ]; then
    echo "  -- $rel (not present in main checkout, skipping)"
    missing=$((missing + 1)); return
  fi

  if [ -e "$dst" ] || [ -L "$dst" ]; then
    if [ "$FORCE" -eq 1 ]; then
      rm -rf "$dst"
    else
      echo "  == $rel (already present, use --force to replace)"
      skipped=$((skipped + 1)); return
    fi
  fi

  mkdir -p "$(dirname "$dst")"
  local size
  size="$(du -sh "$src" 2>/dev/null | cut -f1)"
  echo "  -> $rel  [$size]"
  IN_PROGRESS="$dst"
  if [ "$kind" = link ] && [ -d "$src" ]; then
    clone_dir "$src" "$dst"
  else
    cp -a "$src" "$dst"
  fi
  IN_PROGRESS=""
  copied=$((copied + 1))
}

# --- what a worktree needs ----------------------------------------------------
# node_modules: the repo-root tree holds the hoisted frontend deps, so all three
# are needed for `npm run dev` to resolve in either package.
take link node_modules
take link frontend/node_modules
take link backend/node_modules

# secrets and config — always real copies so edits stay local to the worktree
take real frontend/.env
take real backend/.env

# the backend's JSON store — a real copy so test submissions don't touch live data
take real backend/data

echo
echo "done: $copied copied, $skipped already present, $missing missing"
echo
echo "run it with:"
echo "  cd $DEST/backend  && npm run dev"
echo "  cd $DEST/frontend && npm run dev"
