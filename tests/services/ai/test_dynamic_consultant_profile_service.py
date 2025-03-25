import pytest
from expert_matcher.services.ai.dynamic_consultant_profile_service import (
    generate_dynamic_consultant_profile_from_db,
)
from tests.integration.provider import provide_dynamic_consultant_profile_response


@pytest.mark.asyncio
async def test_generate_dynamic_consultant_profile_from_db():
    dynamic_consultant_profile_response = provide_dynamic_consultant_profile_response()
    dynamic_consultant_profile = await generate_dynamic_consultant_profile_from_db(dynamic_consultant_profile_response)
    assert dynamic_consultant_profile is not None
    assert dynamic_consultant_profile.profile is not None
    assert dynamic_consultant_profile.matching_items is not None
    assert len(dynamic_consultant_profile.matching_items) > 0
