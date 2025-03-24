#!/bin/bash

# Change to the directory containing the script
cd "$(dirname "$0")"

source .venv/bin/activate
uv sync
uv run ./src/expert_matcher/server/ws_server_main.py

