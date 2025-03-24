# Expert Matcher

This project can be used to progressively ask questions about expert skills and then narrow it down to a pool of experts.

## Installation

In order to start the project execute:

```powershell
uv venv
.venv\Scripts\activate
uv sync
```

```bash
uv venv
source .venv/bin/activate
uv sync
```

## Configuration

The environment variables can be found in this file: [.env_local](.env_local)

## Before you run

Please execute:

```bash
cd expert-matcher-ui
npm install
npm run build
```

## Running

```bash
python ./src/expert_matcher/server/ws_server_main.py
```