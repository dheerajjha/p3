"""Configuration management for Claude Code Wrapper."""
import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    # Backend configuration
    backend_url: str = "ws://localhost:3000/wrapper"
    backend_api_key: str

    # Claude SDK configuration
    # NOTE: No API key needed! SDK automatically uses existing Claude Code credentials
    # from ~/.claude/credentials.json (same as your Claude Code CLI)

    # Point to your existing project directory (where you normally run Claude Code)
    workspace_dir: Path = Path.home() / "claude-workspace"

    # Wrapper configuration
    wrapper_id: str = "wrapper-mac-01"
    log_level: str = "INFO"

    # Reconnection settings
    reconnect_delay: int = 5
    max_reconnect_attempts: int = 10

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
