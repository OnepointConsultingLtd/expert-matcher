import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from expert_matcher.config.toml_support import load_toml

load_dotenv()


def create_db_conn_str() -> str:
    db_name = os.getenv("DB_NAME")
    assert db_name is not None
    db_user = os.getenv("DB_USER")
    assert db_user is not None
    db_host = os.getenv("DB_HOST")
    assert db_host is not None
    db_port = os.getenv("DB_PORT")
    assert db_port is not None
    db_port = int(db_port)
    db_password = os.getenv("DB_PASSWORD")
    assert db_password is not None

    return f"dbname={db_name} user={db_user} password={db_password} host={db_host} port={db_port}"


class Config:
    model = os.getenv("OPENAI_MODEL")
    assert model, "OPENAI_MODEL is not set"
    api_key = os.getenv("OPENAI_API_KEY")
    assert api_key, "OPENAI_API_KEY is not set"
    db_conn_str = create_db_conn_str()

    # Connection pool settings
    pool_min_size: int = int(os.getenv("DB_POOL_MIN_SIZE", "1"))
    pool_max_size: int = int(os.getenv("DB_POOL_MAX_SIZE", "10"))
    pool_timeout: float = float(os.getenv("DB_POOL_TIMEOUT", "30.0"))

    base_folder = Path(os.getenv("BASE_FOLDER", ""))
    assert base_folder.exists(), f"BASE_FOLDER {base_folder} does not exist"
    prompts_toml = base_folder / "prompts.toml"
    assert prompts_toml.exists(), f"prompts.toml {prompts_toml} does not exist"
    prompt_templates = load_toml(prompts_toml)

    llm = ChatOpenAI(model=model, api_key=api_key)

    ui_domain = os.getenv("UI_DOMAIN", "localhost")
    ui_port = int(os.getenv("UI_PORT", 8090))


class WebsocketConfig:
    websocket_server = os.getenv("WEBSOCKET_SERVER", "0.0.0.0")
    websocket_port = int(os.getenv("WEBSOCKET_PORT", 8080))
    websocket_cors_allowed_origins = os.getenv("WEBSOCKET_CORS_ALLOWED_ORIGINS", "*")
    ui_folder = Path(os.getenv("UI_FOLDER", "ui"))
    assert ui_folder.exists(), f"UI_FOLDER {ui_folder} does not exist"


cfg = Config()
ws_cfg = WebsocketConfig()
