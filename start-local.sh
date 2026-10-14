#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PID=""
FRONTEND_PID=""

stop_services() {
  trap - INT TERM EXIT
  for pid in "$BACKEND_PID" "$FRONTEND_PID"; do
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  [ -z "$BACKEND_PID" ] || wait "$BACKEND_PID" 2>/dev/null || true
  [ -z "$FRONTEND_PID" ] || wait "$FRONTEND_PID" 2>/dev/null || true
}

trap 'stop_services; exit 130' INT
trap 'stop_services' TERM EXIT

(
  cd "$ROOT_DIR/backend"
  exec ./mvnw spring-boot:run
) &
BACKEND_PID=$!

(
  cd "$ROOT_DIR/frontend"
  if [ ! -x node_modules/.bin/vite ]; then
    npm install
  fi
  exec ./node_modules/.bin/vite --host 127.0.0.1 --strictPort
) &
FRONTEND_PID=$!

printf 'BankEase is starting. Open http://localhost:5173\nPress Ctrl+C to stop the frontend and backend.\n'

while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do
  sleep 1
done

printf 'A service stopped; stopping the other service.\n' >&2
exit 1
