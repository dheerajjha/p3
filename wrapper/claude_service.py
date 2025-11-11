"""Service for interacting with Claude Agent SDK."""
import asyncio
import logging
from typing import AsyncIterator, Optional
from pathlib import Path

from claude_sdk import ClaudeSDKClient, ClaudeAgentOptions
from claude_sdk.models import Message

from config import settings


logger = logging.getLogger(__name__)


class ClaudeService:
    """Wrapper service for Claude Agent SDK."""

    def __init__(self):
        """Initialize Claude service."""
        self.workspace_dir = Path(settings.workspace_dir)
        self.workspace_dir.mkdir(parents=True, exist_ok=True)

        self.options = ClaudeAgentOptions(
            api_key=settings.anthropic_api_key,
            working_directory=str(self.workspace_dir),
            allowed_tools=[
                "read",
                "write",
                "edit",
                "bash",
                "grep",
                "glob"
            ],
            system_prompt=(
                "You are a helpful coding assistant. "
                "Be concise and friendly. "
                "Always explain what you're doing in simple terms."
            )
        )

        self.current_session: Optional[str] = None
        self.client: Optional[ClaudeSDKClient] = None

    async def execute_query(
        self,
        session_id: str,
        prompt: str
    ) -> AsyncIterator[Message]:
        """
        Execute a query with Claude SDK.

        Args:
            session_id: Session identifier
            prompt: User prompt

        Yields:
            Message objects from Claude SDK
        """
        try:
            self.current_session = session_id
            logger.info(f"Starting query for session {session_id}")

            async with ClaudeSDKClient(options=self.options) as client:
                self.client = client

                # Send the query
                await client.query(prompt)

                # Stream responses
                async for message in client.receive_response():
                    yield message

            logger.info(f"Query completed for session {session_id}")

        except Exception as e:
            logger.error(f"Error executing query: {e}", exc_info=True)
            raise

        finally:
            self.current_session = None
            self.client = None

    async def stop_execution(self, session_id: str):
        """
        Stop current execution.

        Args:
            session_id: Session identifier
        """
        if self.current_session == session_id and self.client:
            logger.info(f"Stopping execution for session {session_id}")
            # Note: Actual stop implementation depends on Claude SDK
            # This is a placeholder
            self.client = None
            self.current_session = None
