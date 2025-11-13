"""Service for interacting with Claude Code CLI directly."""
import asyncio
import logging
import subprocess
import json
from typing import AsyncIterator, Optional
from pathlib import Path

from config import settings


logger = logging.getLogger(__name__)


class ClaudeService:
    """Wrapper service using Claude Code CLI."""

    def __init__(self):
        """Initialize Claude service."""
        self.workspace_dir = Path(settings.workspace_dir)
        self.workspace_dir.mkdir(parents=True, exist_ok=True)
        self.current_session: Optional[str] = None

    async def execute_query(
        self,
        session_id: str,
        prompt: str
    ) -> AsyncIterator[dict]:
        """
        Execute a query using Claude Code CLI.

        Args:
            session_id: Session identifier
            prompt: User prompt

        Yields:
            Message dictionaries
        """
        try:
            self.current_session = session_id
            logger.info(f"Starting query for session {session_id}")

            # Use Claude Code CLI in print mode
            process = await asyncio.create_subprocess_exec(
                'claude',
                '-p',  # Print mode (non-interactive)
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(self.workspace_dir)
            )

            # Send prompt
            stdout, stderr = await process.communicate(input=prompt.encode())

            if process.returncode == 0:
                response = stdout.decode().strip()

                # Yield the response
                yield {
                    "role": "assistant",
                    "content": response,
                    "type": "text"
                }
            else:
                error_msg = stderr.decode().strip()
                logger.error(f"Claude CLI error: {error_msg}")
                raise Exception(f"Claude CLI error: {error_msg}")

            logger.info(f"Query completed for session {session_id}")

        except Exception as e:
            logger.error(f"Error executing query: {e}", exc_info=True)
            raise

        finally:
            self.current_session = None

    async def stop_execution(self, session_id: str):
        """
        Stop current execution.

        Args:
            session_id: Session identifier
        """
        if self.current_session == session_id:
            logger.info(f"Stopping execution for session {session_id}")
            self.current_session = None
