
# Activate the virtual environment
.venv\Scripts\activate

uv sync

# Run the script
python src\expert_matcher\server\ws_server_main.py