import asyncio
import os
import re

from aiohttp import web

from expert_matcher.config.config import ws_cfg, cfg
from expert_matcher.server.ws_server import app

routes = web.RouteTableDef()

UI_DIST_FOLDER = ws_cfg.ui_folder / "dist"

FILE_INDEX = "index.html"
PATH_INDEX = UI_DIST_FOLDER / FILE_INDEX
INDEX_LINKS = ["/", "/admin"]


async def get_index(_: web.Request) -> web.Response:
    return web.FileResponse(PATH_INDEX)


def overwrite_ui_properties():
    file = UI_DIST_FOLDER / "index.html"
    assert file.exists(), f"File {file} does not exist"
    content = file.read_text(encoding="utf-8")
    content = re.sub(r"127\.0\.0\.1", cfg.ui_domain, content)
    content = re.sub(r"8090", str(cfg.ui_port), content)
    file.write_text(content, encoding="utf-8")


def run_server():
    # Compile the client app using vite
    original_dir = os.getcwd()
    os.chdir(ws_cfg.ui_folder)
    os.system("npm install")
    os.system("npm run build")
    os.chdir(original_dir)
    overwrite_ui_properties()

    # Setup the routes for the web application
    for url in INDEX_LINKS:
        app.router.add_get(url, get_index)
    app.add_routes(routes)
    for folder in ["images", "assets"]:
        app.router.add_static(
            f"/{folder}", path=(UI_DIST_FOLDER / folder).as_posix(), name=folder
        )

    loop = asyncio.new_event_loop()

    web.run_app(
        app,
        host=ws_cfg.websocket_server,
        port=ws_cfg.websocket_port,
        loop=loop,
    )


if __name__ == "__main__":
    run_server()
