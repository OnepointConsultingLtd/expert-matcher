from expert_matcher.config.config import cfg


def test_config():
    assert cfg.model is not None
    assert cfg.api_key is not None
    assert cfg.db_conn_str is not None
    assert "dbname" in cfg.db_conn_str
    assert "user" in cfg.db_conn_str
    assert "password" in cfg.db_conn_str
    assert "host" in cfg.db_conn_str
    assert "port" in cfg.db_conn_str
