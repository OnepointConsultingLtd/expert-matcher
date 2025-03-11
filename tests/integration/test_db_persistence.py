import pytest

from consultant_finder.model.question import QuestionSuggestions
from consultant_finder.services.db.db_persistence import select_first_question


@pytest.mark.asyncio
async def test_select_first_question():
    """Test selecting the first question with its suggestions."""
    result = await select_first_question()
    
    assert result is not None
    assert isinstance(result, QuestionSuggestions) 
    assert result.category is not None
    assert result.question is not None
    assert result.suggestions is not None
    assert len(result.suggestions) > 0