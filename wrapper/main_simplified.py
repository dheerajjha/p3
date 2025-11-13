"""Simplified main entry point for Claude Code Wrapper using CLI."""
import asyncio
import json
import logging
import sys
from typing import Optional

import websockets
from websockets.exceptions import ConnectionClosed

from config import settings
from models import (
    ExecuteCommand,
    MessageUpdate,
    ErrorUpdate,
    StatusUpdate,
    CompleteUpdate
)
from claude_service_cli import ClaudeService


# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class WrapperClient:
    """WebSocket client for connecting wrapper to backend."""

    def __init__(self):
        """Initialize wrapper client."""
        self.ws: Optional[websockets.WebSocketClientProtocol] = None
        self.claude_service = ClaudeService()
        self.reconnect_attempts = 0
        self.is_running = True

    async def connect(self):
        """Connect to backend server."""
        logger.info(f"Connecting to backend: {settings.backend_url}")

        try:
            # Use additional_headers for websockets library
            custom_headers = [
                ("Authorization", f"Bearer {settings.backend_api_key}"),
                ("X-Wrapper-ID", settings.wrapper_id)
            ]

            self.ws = await websockets.connect(
                settings.backend_url,
                additional_headers=custom_headers
            )
            self.reconnect_attempts = 0
            logger.info("Connected to backend successfully")

            # Send status update
            await self.send_status("connected")

        except Exception as e:
            logger.error(f"Connection failed: {e}")
            raise

    async def send_status(self, status: str):
        """Send status update to backend."""
        if not self.ws:
            return

        update = StatusUpdate(
            wrapper_id=settings.wrapper_id,
            status=status
        )

        await self.ws.send(update.model_dump_json())

    async def send_message(self, session_id: str, data: dict):
        """Send message update to backend."""
        if not self.ws:
            return

        update = MessageUpdate(
            session_id=session_id,
            data=data
        )

        await self.ws.send(update.model_dump_json())

    async def send_error(self, session_id: str, error: str, details: dict = None):
        """Send error update to backend."""
        if not self.ws:
            return

        update = ErrorUpdate(
            session_id=session_id,
            error=error,
            details=details
        )

        await self.ws.send(update.model_dump_json())

    async def send_complete(self, session_id: str):
        """Send completion update to backend."""
        if not self.ws:
            return

        update = CompleteUpdate(session_id=session_id)
        await self.ws.send(update.model_dump_json())

    async def handle_execute_command(self, command: ExecuteCommand):
        """Handle execute command from backend."""
        logger.info(f"Executing command: {command.command} for session {command.session_id}")

        try:
            await self.send_status("busy")

            if command.command == "query":
                prompt = command.payload.get("prompt", "")

                async for message_data in self.claude_service.execute_query(
                    command.session_id,
                    prompt
                ):
                    await self.send_message(command.session_id, message_data)

                await self.send_complete(command.session_id)

            elif command.command == "stop":
                await self.claude_service.stop_execution(command.session_id)
                await self.send_complete(command.session_id)

            await self.send_status("ready")

        except Exception as e:
            logger.error(f"Error handling command: {e}", exc_info=True)
            await self.send_error(
                command.session_id,
                str(e),
                {"command": command.command}
            )
            await self.send_status("ready")

    async def listen(self):
        """Listen for commands from backend."""
        try:
            async for message in self.ws:
                try:
                    data = json.loads(message)

                    if data.get("type") == "execute":
                        command = ExecuteCommand(**data)
                        # Handle command in background
                        asyncio.create_task(self.handle_execute_command(command))

                    else:
                        logger.warning(f"Unknown message type: {data.get('type')}")

                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON: {e}")
                except Exception as e:
                    logger.error(f"Error processing message: {e}", exc_info=True)

        except ConnectionClosed:
            logger.warning("Connection closed by backend")
            raise

    async def run(self):
        """Main run loop with reconnection logic."""
        while self.is_running:
            try:
                await self.connect()
                await self.send_status("ready")
                await self.listen()

            except Exception as e:
                logger.error(f"Connection error: {e}")

                if self.reconnect_attempts < settings.max_reconnect_attempts:
                    self.reconnect_attempts += 1
                    delay = settings.reconnect_delay * self.reconnect_attempts
                    logger.info(f"Reconnecting in {delay} seconds (attempt {self.reconnect_attempts})")
                    await asyncio.sleep(delay)
                else:
                    logger.error("Max reconnection attempts reached. Exiting.")
                    break

            finally:
                if self.ws:
                    await self.ws.close()
                    self.ws = None

    async def shutdown(self):
        """Graceful shutdown."""
        logger.info("Shutting down wrapper...")
        self.is_running = False

        if self.ws:
            await self.send_status("disconnected")
            await self.ws.close()


async def main():
    """Main function."""
    client = WrapperClient()

    try:
        await client.run()
    except KeyboardInterrupt:
        logger.info("Received interrupt signal")
    finally:
        await client.shutdown()


if __name__ == "__main__":
    asyncio.run(main())
