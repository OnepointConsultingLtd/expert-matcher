import logging
import logging.config

default_config = {
    "version": 1,
    "formatters": {
        "default": {
            "format": "[%(asctime)s] %(levelname)s - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "level": "INFO",
            "stream": "ext://sys.stderr",
        }
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}
logging.config.dictConfig(default_config)

logger = logging.getLogger("consultant_info_generator")

if __name__ == "__main__":
    logger.warning("Hello, world!")
    logger.info("Hello, world!")
