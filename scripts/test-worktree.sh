#!/usr/bin/env bash
#
# Set up a Claude worktree with everything gitignored-but-required from the main
# checkout, then run its frontend on port 9000 and its backend on port 9001 —
# clear of the 5173/5003 a normal `npm run dev` uses, so a worktree under test
# never collides with the main checkout. Ctrl-C stops both.
#
#   ./scripts/test-worktree.sh                 # test the worktree you're in
#   ./scripts/test-worktree.sh gallery-bleed   # test .claude/worktrees/gallery-bleed
#   ./scripts/test-worktree.sh /path/to/wt     # test an arbitrary worktree
#
# Options:
#   --no-run    copy the files but don't start the servers
#   --force     overwrite items that already exist in the worktree
#   --copy      force real (deep) copies instead of reflink/hardlink clones
#   --symlink   symlink node_modules back to the main checkout (fastest, but a
#               `npm install` in the worktree then mutates the main checkout)
#   --list      list available worktrees and exit
#
set -euo pipefail

FORCE=0
RUN=1
MODE=clone   # clone | copy | symlink
TARGET=""

# print the comment block at the top of this file, minus the shebang
usage() { awk 'NR>1 && /^#/ { sub(/^# ?/, ""); print; next } NR>1 { exit }' "$0"; }

while [ $# -gt 0 ]; do
  case "$1" in
    --force)   FORCE=1 ;;
    --no-run)  RUN=0 ;;
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

if [ -t 1 ]; then
  DIM=$'\033[2m'; BOLD=$'\033[1m'; CYAN=$'\033[36m'; MAGENTA=$'\033[35m'
  YELLOW=$'\033[33m'; RESET=$'\033[0m'
else
  DIM=""; BOLD=""; CYAN=""; MAGENTA=""; YELLOW=""; RESET=""
fi

echo "source: $MAIN"
echo "target: ${BOLD}$DEST${RESET}"

# --- copy helpers -------------------------------------------------------------
# A partly-written destination is worse than none: it looks "already present" on
# the next run. Clean up whatever we were mid-way through on any failure.
IN_PROGRESS=""

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
  echo "     ${DIM}($CLONE_DESC)${RESET}"
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
      echo "  ${DIM}== $rel (already present, use --force to replace)${RESET}"
      skipped=$((skipped + 1)); return
    fi
  fi

  mkdir -p "$(dirname "$dst")"
  local size
  size="$(du -sh "$src" 2>/dev/null | cut -f1)"
  echo "  -> $rel  ${DIM}[$size]${RESET}"
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
echo "ready: $copied copied, $skipped already present, $missing missing"

if [ "$RUN" -eq 0 ]; then
  echo
  echo "run it with:"
  echo "  cd $DEST/backend  && PORT=9001 npm run dev"
  echo "  cd $DEST/frontend && VITE_DEV_API_URL=http://localhost:9001/api npm run dev -- --port 9000 --strictPort"
  exit 0
fi

# --- run both dev servers -----------------------------------------------------
# Fixed ports, deliberately clear of the 5173/5003 pair a normal `npm run dev`
# uses, so a worktree under test never collides with the main checkout and you
# always know which one you're looking at.
FRONTEND_PORT=9000
BACKEND_PORT=9001

BACKEND_PID=""
FRONTEND_PID=""
SHUTTING_DOWN=0

port_busy() {
  local p="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn "sport = :$p" 2>/dev/null | grep -q LISTEN
  else
    (timeout 1 bash -c ": </dev/tcp/127.0.0.1/$p") >/dev/null 2>&1
  fi
}

# Each server goes into its own process group, so one signal takes down the whole
# tree — npm, the tsx/vite child it spawns, and the log prefixer.
#
# The pid comes back through a named variable rather than stdout: a command
# substitution would hand the server its pipe as stdout and then block forever
# waiting for an EOF that a long-running server never sends.
start_service() {
  local label="$1" color="$2" dir="$3" pidvar="$4" cmd="$5"
  local prefix="${color}[${label}]${RESET} "
  local runner=""
  command -v setsid >/dev/null 2>&1 && runner="setsid"
  $runner bash -c "cd '$dir' && $cmd 2>&1 | sed -u 's/^/$prefix/'" &
  printf -v "$pidvar" '%s' "$!"
}

SELF_PGID="$(ps -o pgid= -p $$ 2>/dev/null | tr -d ' ')"

# Signal the service's whole process group, so npm's children go too. Falls back
# to the bare pid if the group is missing or turns out to be our own — never
# signal our own group, that would take this script (and its shell) with it.
stop_service() {
  local sig="$1" pid="$2"
  [ -n "$pid" ] || return 0
  kill -0 "$pid" 2>/dev/null || return 0
  local pgid
  pgid="$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d ' ')"
  if [ -n "$pgid" ] && [ "$pgid" != "$SELF_PGID" ]; then
    kill "-$sig" "-$pgid" 2>/dev/null || kill "-$sig" "$pid" 2>/dev/null || true
  else
    kill "-$sig" "$pid" 2>/dev/null || true
  fi
}

still_running() {
  { [ -n "$FRONTEND_PID" ] && kill -0 "$FRONTEND_PID" 2>/dev/null; } && return 0
  { [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; } && return 0
  return 1
}

shutdown() {
  [ "$SHUTTING_DOWN" -eq 1 ] && return 0
  SHUTTING_DOWN=1
  echo
  echo "${DIM}stopping…${RESET}"
  stop_service TERM "$FRONTEND_PID"
  stop_service TERM "$BACKEND_PID"
  # give them a few seconds to exit cleanly, then insist
  local i=0
  while [ $i -lt 50 ]; do
    still_running || break
    sleep 0.1
    i=$((i + 1))
  done
  if still_running; then
    stop_service KILL "$FRONTEND_PID"
    stop_service KILL "$BACKEND_PID"
  fi
  wait 2>/dev/null || true
  echo "${DIM}stopped.${RESET}"
}

cleanup() {
  local status=$?
  trap - EXIT
  [ -n "$IN_PROGRESS" ] && rm -rf "$IN_PROGRESS"
  shutdown
  exit $status
}
trap cleanup EXIT
trap 'cleanup; exit 130' INT TERM HUP

# Both ports are fixed, so a busy one means something else is squatting: say what
# and stop, rather than drifting onto a port nothing is configured to talk to.
port_conflict=0
for p in "$FRONTEND_PORT" "$BACKEND_PORT"; do
  if port_busy "$p"; then
    echo
    echo "${YELLOW}error:${RESET} port $p is already in use." >&2
    if command -v ss >/dev/null 2>&1; then
      ss -ltnp "sport = :$p" 2>/dev/null | tail -n +2 | sed 's/^/       /' >&2
    fi
    port_conflict=1
  fi
done
if [ "$port_conflict" -eq 1 ]; then
  echo "       stop whatever is holding it, then re-run." >&2
  exit 1
fi

echo
# The backend reads PORT (backend/src/server.ts); the frontend needs --strictPort
# so vite fails loudly instead of quietly hopping to 9001 and colliding with it.
# VITE_DEV_API_URL points the frontend's API calls at the backend we just moved.
start_service backend "$CYAN" "$DEST/backend" BACKEND_PID \
  "PORT=$BACKEND_PORT npm run dev"
start_service frontend "$MAGENTA" "$DEST/frontend" FRONTEND_PID \
  "VITE_DEV_API_URL=http://localhost:$BACKEND_PORT/api npm run dev -- --port $FRONTEND_PORT --strictPort"

echo "  frontend  ${BOLD}http://localhost:$FRONTEND_PORT${RESET}"
echo "  backend   ${BOLD}http://localhost:$BACKEND_PORT${RESET}"
echo "${DIM}Ctrl-C stops both.${RESET}"
echo

# Wait until either one exits (or a signal arrives), then take the other down.
while :; do
  if [ -n "$BACKEND_PID" ] && ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo; echo "${YELLOW}backend exited.${RESET}"; break
  fi
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo; echo "${YELLOW}frontend exited.${RESET}"; break
  fi
  # background the sleep so a signal is handled the moment it lands
  sleep 0.5 & wait $! 2>/dev/null || true
done

# One of them stopped without being asked to, so this run didn't do what it said.
exit 1
