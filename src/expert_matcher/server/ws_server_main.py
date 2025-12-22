import asyncio
import os
import re
import sys

from aiohttp import web
from typing import Awaitable

from expert_matcher.config.config import ws_cfg, cfg
from expert_matcher.server.ws_server import app
from expert_matcher.services.ai.dynamic_consultant_profile_service import (
    generate_dynamic_consultant_profile,
)
from expert_matcher.services.pdf.candidate_report import generate_candidate_report
from expert_matcher.config.logger import logger

routes = web.RouteTableDef()

UI_DIST_FOLDER = ws_cfg.ui_folder / "dist"

FILE_INDEX = "index.html"
PATH_INDEX = UI_DIST_FOLDER / FILE_INDEX
INDEX_LINKS = ["/", "/admin"]

CORS_HEADERS = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*"}


async def get_index(_: web.Request) -> web.Response:
    return web.FileResponse(PATH_INDEX)


async def handle_error(func: Awaitable) -> Awaitable:
    try:
        return await func()
    except Exception as e:
        logger.exception("Error in %s: %s", func.__name__, e)
        return web.json_response({"error": str(e)}, status=500, headers=CORS_HEADERS)


@routes.options("/api/dynamic-profile/{session_id}")
async def get_dynamic_profile_options(_: web.Request) -> web.Response:
    return web.json_response({"message": "Accept all hosts"}, headers=CORS_HEADERS)


@routes.get("/api/dynamic-profile/{session_id}")
async def get_dynamic_profile(request: web.Request) -> web.Response:
    async def _get_dynamic_profile():
        session_id = request.match_info.get("session_id", None)
        if not session_id:
            return web.json_response(
                {"error": "Session ID is required"}, status=400, headers=CORS_HEADERS
            )
        email = request.rel_url.query.get("email", None)
        if not email:
            return web.json_response(
                {"error": "Email is required"}, status=400, headers=CORS_HEADERS
            )
        dynamic_profile = await generate_dynamic_consultant_profile(session_id, email)
        if not dynamic_profile:
            return web.json_response({"error": "Dynamic profile not found"}, status=404)
        return web.json_response(dynamic_profile.model_dump(), headers=CORS_HEADERS)

    return await handle_error(_get_dynamic_profile)


@routes.options("/api/report-consultants/{session_id}")
async def get_report_consultants_options(_: web.Request) -> web.Response:
    return web.json_response({"message": "Accept all hosts"}, headers=CORS_HEADERS)


@routes.get("/api/report-consultants/{session_id}")
async def get_report_consultants(request: web.Request) -> web.Response:
    async def _get_report_consultants():
        session_id = request.match_info.get("session_id", None)
        if not session_id:
            return web.json_response({"error": "Session ID is required"}, status=400)
        report_path = await generate_candidate_report(session_id)
        return web.FileResponse(
            report_path,
            headers={
                "CONTENT-DISPOSITION": f'attachment; filename="{report_path.name}"'
            },
        )

    return await handle_error(_get_report_consultants)


def overwrite_ui_properties():
    file = UI_DIST_FOLDER / "index.html"
    assert file.exists(), f"File {file} does not exist"
    content = file.read_text(encoding="utf-8")
    content = re.sub(r"127\.0\.0\.1", cfg.ui_domain, content)
    content = re.sub(r"8090", str(cfg.ui_port), content)
    file.write_text(content, encoding="utf-8")


def run_server():
    # Compile the client app using vite
    if "--no-ui-build" not in sys.argv:
        print("Building UI", sys.argv)
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
