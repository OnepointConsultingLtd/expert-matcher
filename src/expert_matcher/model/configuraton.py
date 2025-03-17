class Configuration:
    def __init__(self, config: dict[str, str]):
        self.config: dict[str, str] = config

    def get_config(self):
        return self.config
