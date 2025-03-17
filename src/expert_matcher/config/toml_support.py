from pathlib import Path
import tomli


def load_toml(file_path: Path) -> dict:
    """Load a TOML file and return a dictionary"""
    with open(file_path, "rb") as f:
        return tomli.load(f)
