import asyncio
import os

from aiohttp import web

from expert_matcher.config.config import ws_cfg
from expert_matcher.server.ws_server import app

routes = web.RouteTableDef()

FILE_INDEX = "index.html"
PATH_INDEX = ws_cfg.ui_folder / FILE_INDEX
INDEX_LINKS = ["/", "/admin"]


async def get_index(_: web.Request) -> web.Response:
    return web.FileResponse(PATH_INDEX)


def run_server():
    # Compile the client app using vite
    original_dir = os.getcwd()
    os.chdir(ws_cfg.ui_folder)
    os.system("npm run build")
    os.chdir(original_dir)
    
    # Setup the routes for the web application
    for url in INDEX_LINKS:
        app.router.add_get(url, get_index)
    app.add_routes(routes)
    for folder in ["images", "assets"]:
        app.router.add_static(
            f"/{folder}", path=(ws_cfg.ui_folder / folder).as_posix(), name=folder
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
