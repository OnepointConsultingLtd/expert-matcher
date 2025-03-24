#!/bin/bash

# Change to the directory containing the script
cd "$(dirname "$0")"

source .venv/bin/activate
/home/ubuntu/.local/bin/uv sync
/home/ubuntu/.local/bin/uv run ./src/expert_matcher/server/ws_server_main.py

