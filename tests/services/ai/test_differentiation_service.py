from expert_matcher.services.ai.differentiation_service import prompt_factory


def test_prompt_factory():
    prompt = prompt_factory()
    assert prompt is not None
    assert len(prompt.messages) == 2
    assert prompt.messages[0].prompt.template is not None
    assert prompt.messages[1].prompt.template is not None
