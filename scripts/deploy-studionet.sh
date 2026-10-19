#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/preflight.py
if [[ ! -x node_modules/.bin/genlayer ]]; then
  echo 'Install the repository-local pinned CLI first: npm install' >&2
  exit 2
fi
echo 'Confirming repo-local GenLayer CLI'
./node_modules/.bin/genlayer --version
./node_modules/.bin/genlayer network set studionet
./node_modules/.bin/genlayer network info
echo 'This script will deploy a new Intelligent Contract and consume your configured CLI wallet funds.'
read -r -p 'Type DEPLOY_STUDIONET to proceed: ' approval
[[ "$approval" == 'DEPLOY_STUDIONET' ]] || { echo 'Aborted';exit 1; }
./node_modules/.bin/genlayer deploy --contract contracts/cogent.py --rpc https://studio.genlayer.com/api
