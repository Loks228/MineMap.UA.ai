import os
import sqlite3
import aiosqlite
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database path
DATABASE_PATH = os.getenv("DATABASE_PATH", "minemap.db")

@asynccontextmanager
async def get_connection():
    """Get a connection to the database."""
    conn = await aiosqlite.connect(DATABASE_PATH)
    conn.row_factory = aiosqlite.Row
    try:
        yield conn
    finally:
        await conn.close()

def get_sync_connection():
    """Get a synchronous connection to the database."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn
