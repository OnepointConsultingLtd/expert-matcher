from consultant_finder.config.config import cfg


def test_config():
    assert cfg.model is not None
    assert cfg.api_key is not None
    assert cfg.db_conn_str is not None
