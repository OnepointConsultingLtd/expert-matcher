$ErrorActionPreference = 'Stop'

# Go to the folder this script lives in (project root)
Set-Location $PSScriptRoot

Start-Process powershell.exe -WorkingDirectory $PSScriptRoot -ArgumentList @(
    '-NoExit'
    '-Command'
    'uv sync; uv run python src\expert_matcher\server\ws_server_main.py --no-ui-build'
)

# Start the UI server from the onepoint-chat-ui folder using run_ui.ps1 in another window
$uiScript = Join-Path $PSScriptRoot 'expert-matcher-ui\run.ps1'
Start-Process powershell.exe -WorkingDirectory (Split-Path $uiScript -Parent) -ArgumentList @(
    '-NoExit'
    '-File'
    "`"$uiScript`""
)