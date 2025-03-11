import asyncio
import sys
from typing import Optional, Any, Awaitable, TypeVar, Callable, List, Dict

from psycopg import AsyncConnection, AsyncCursor
from psycopg_pool import AsyncConnectionPool
from psycopg.rows import Row

from consultant_finder.config.config import cfg
from consultant_finder.config.logger import logger

# Type variable for generic return types
T = TypeVar('T')

# Global connection pool
_pool: Optional[AsyncConnectionPool] = None


if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


async def create_simple_connection(conninfo: str = cfg.db_conn_str) -> AsyncConnection:
    """Create a simple database connection without pooling."""
    return await AsyncConnection.connect(conninfo)


async def get_pool() -> AsyncConnectionPool:
    """Get or create the connection pool."""
    global _pool
    if _pool is None:
        _pool = AsyncConnectionPool(
            conninfo=cfg.db_conn_str,
            open=True,
            min_size=cfg.pool_min_size,
            max_size=cfg.pool_max_size,
            timeout=cfg.pool_timeout
        )
    return _pool


async def close_pool() -> None:
    """Close the connection pool if it exists."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


async def create_cursor(
    func: Callable[[AsyncCursor], Awaitable[T]],
    commit: bool = False
) -> Optional[T]:
    """
    Create a cursor and execute a function with it.
    
    Args:
        func: Async function to execute with the cursor
        commit: Whether to commit the transaction after execution
        
    Returns:
        The result of the function execution or None if an error occurs
        
    Raises:
        Exception: If the function execution fails
    """
    pool = await get_pool()
    try:
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                result = await func(cur)
                if commit:
                    await conn.commit()
                return result
    except Exception as e:
        logger.error("Database operation failed: %s", str(e))
        logger.exception("Could not execute database operation.")
        raise


async def handle_select_func(
    query: str,
    query_params: Dict[str, Any]
) -> Callable[[AsyncCursor], Awaitable[List[Row]]]:
    """
    Create a function that executes a SELECT query.
    
    Args:
        query: SQL query string
        query_params: Parameters for the query
        
    Returns:
        A function that executes the query and returns the results
    """
    async def func(cur: AsyncCursor) -> List[Row]:
        await cur.execute(query, query_params)
        return list(await cur.fetchall())
    return func


async def select_from(query: str, parameter_map: Dict[str, Any]) -> List[Row]:
    """
    Execute a SELECT query and return the results.
    
    Args:
        query: SQL query string
        parameter_map: Parameters for the query
        
    Returns:
        List of rows from the query result
        
    Raises:
        Exception: If the query execution fails
    """
    handle_select = await handle_select_func(query, parameter_map)
    result = await create_cursor(handle_select, False)
    if result is None:
        return []
    return result