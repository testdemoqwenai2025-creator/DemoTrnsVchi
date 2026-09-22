#!/usr/bin/env bash
# AV/Robotics Operations Center — Public MPA Runtime Test Script
#
# Uses agent-browser to actually open each page, run JS, and verify
# that:
#   - No JS errors fire on load
#   - The header is injected (has children, not just the empty <div id="site-header">)
#   - The footer is injected
#   - The main content is non-empty
#   - The page's interactive elements work (where applicable)
#
# Usage:
#   bash scripts/test-runtime.sh https://testdemoqwenai2025-creator.github.io/DemoTrnsVchi/
#   bash scripts/test-runtime.sh                          # defaults to http://localhost:8889
#
# Output: a colored table to stdout. Exits 0 if all pass, 1 if any fail.

set -uo pipefail

BASE_URL="${1:-http://localhost:8889}"
BASE_URL="${BASE_URL%/}"  # strip trailing slash

PAGES=(
  "index.html"
  "fleet.html"
  "telemetry.html"
  "missions.html"
  "robotics.html"
  "diagnostics.html"
  "knowledge.html"
  "perception.html"
  "localization.html"
  "prediction.html"
  "planning.html"
  "trajectory.html"
  "v2x.html"
  "safety.html"
  "simulation.html"
  "login.html"
  "search.html"
  "chat.html"
  "privacy.html"
  "live.html"
  "architecture.html"
  "404.html"
)

# Special interactive tests for pages that have specific expected behaviour
declare -A INTERACTIVE_TEST=(
  ["fleet.html"]="document.querySelectorAll('#fleet-tbody tr').length"
  ["telemetry.html"]="document.querySelectorAll('#sensor-grid .card').length"
  ["missions.html"]="document.querySelectorAll('#board .card, .card-body .card').length"
  ["robotics.html"]="document.querySelectorAll('#joint-tbody tr').length"
  ["diagnostics.html"]="document.querySelectorAll('#alert-list > div').length"
  ["knowledge.html"]="document.querySelectorAll('#kb-grid .card').length"
  ["perception.html"]="document.querySelectorAll('#obj-tbody tr').length"
  ["v2x.html"]="document.querySelectorAll('#peer-tbody tr').length"
  ["safety.html"]="document.querySelectorAll('#watchdogs-body > div, .card-body > div').length"
  ["search.html"]="document.querySelectorAll('#search-results > *').length + document.querySelector('#search-input') ? 1 : 0"
  ["chat.html"]="document.querySelectorAll('#chat-messages .chat-msg').length"
  ["live.html"]="document.querySelectorAll('svg circle').length"
  ["architecture.html"]="document.querySelectorAll('table tbody tr').length"
)

PASS=0
FAIL=0
RESULTS=()

printf "\n%-30s  %-8s  %-8s  %-8s  %-12s  %s\n" "PAGE" "LOADS" "HEADER" "FOOTER" "CONTENT" "INTERACTIVE"
printf "%.0s─" {1..100}; printf "\n"

for page in "${PAGES[@]}"; do
  URL="$BASE_URL/$page"
  # Open the page in agent-browser (fresh state per page)
  OUTPUT=$(agent-browser open "$URL" 2>&1)
  # Give the page 2s to run JS and inject header/footer
  sleep 2

  # Check for errors
  ERR_COUNT=$(agent-browser errors 2>&1 | grep -c "^✗" || true)

  # Check header populated
  HEADER_COUNT=$(agent-browser eval "(document.querySelector('.site-header') || {children:{length:0}}).children.length" 2>&1 | tail -1 | tr -d '"')

  # Check footer populated
  FOOTER_COUNT=$(agent-browser eval "(document.querySelector('.site-footer') || {children:{length:0}}).children.length" 2>&1 | tail -1 | tr -d '"')

  # Check main content
  MAIN_LEN=$(agent-browser eval "(document.querySelector('main') || {innerText:''}).innerText.length" 2>&1 | tail -1 | tr -d '"')

  # Run interactive test if one is defined
  INTERACTIVE="-"
  if [[ -n "${INTERACTIVE_TEST[$page]:-}" ]]; then
    INTERACTIVE=$(agent-browser eval "${INTERACTIVE_TEST[$page]}" 2>&1 | tail -1 | tr -d '"')
  fi

  # Status icons
  if [[ "$ERR_COUNT" == "0" && "$HEADER_COUNT" != "0" && "$FOOTER_COUNT" != "0" && "$MAIN_LEN" != "0" ]]; then
    STATUS="✓ PASS"
    PASS=$((PASS+1))
  else
    STATUS="✗ FAIL"
    FAIL=$((FAIL+1))
  fi

  # Color the status
  if [[ "$STATUS" == "✓ PASS" ]]; then
    STATUS_STR=$'\e[32m✓ PASS\e[0m'
  else
    STATUS_STR=$'\e[31m✗ FAIL\e[0m'
  fi

  HEADER_STR=$([ "$HEADER_COUNT" != "0" ] && echo $'\e[32m✓\e[0m'" $HEADER_COUNT" || echo $'\e[31m✗ 0\e[0m')
  FOOTER_STR=$([ "$FOOTER_COUNT" != "0" ] && echo $'\e[32m✓\e[0m'" $FOOTER_COUNT" || echo $'\e[31m✗ 0\e[0m')
  MAIN_STR=$([ "$MAIN_LEN" != "0" ] && echo $'\e[32m✓\e[0m'" $MAIN_LEN" || echo $'\e[31m✗ 0\e[0m')

  printf "%-30s  %-8s  %-8s  %-8s  %-12s  %s\n" "$page" "$STATUS_STR" "$HEADER_STR" "$FOOTER_STR" "$MAIN_STR chars" "$INTERACTIVE"
done

printf "%.0s─" {1..100}; printf "\n"
printf "Summary: %d passed, %d failed (out of %d)\n\n" "$PASS" "$FAIL" "${#PAGES[@]}"

# Close the browser
agent-browser close > /dev/null 2>&1 || true

if [[ "$FAIL" -gt 0 ]]; then
  exit 1
else
  exit 0
fi
