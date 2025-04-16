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

## Running the application

Make sure the Postgres database is up an running with the environment variables correctly configured before you start the application below.

Please execute:

```bash
cd expert-matcher-ui
npm install
npm run build
```

## Running

```bash
# Linux
source .venv/bin/activate
# Windows
.venv\Scripts\activate
python ./src/expert_matcher/server/ws_server_main.py
```

You can also start via scripts:

- Windows: `run.ps1`
- Linux: `run.sh`

## Developing

Start the client with:

```
cd ./expert-matcher-ui
yarn
yarn dev
```

and the server with the command mentioned in the "Running" section.