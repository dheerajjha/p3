"""Data models for wrapper communication."""
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone


def utc_now() -> datetime:
    """Get current UTC time as timezone-aware datetime."""
    return datetime.now(timezone.utc)


class ExecuteCommand(BaseModel):
    """Command from backend to wrapper."""
    type: Literal["execute"] = "execute"
    session_id: str
    command: Literal["query", "stop"]
    payload: Dict[str, Any]


class MessageUpdate(BaseModel):
    """Message update from wrapper to backend."""
    type: Literal["message"] = "message"
    session_id: str
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=utc_now)

    model_config = ConfigDict(
        json_encoders={
            datetime: lambda v: v.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
        }
    )


class ToolExecutionUpdate(BaseModel):
    """Tool execution update from wrapper to backend."""
    type: Literal["tool_execution"] = "tool_execution"
    session_id: str
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=utc_now)

    model_config = ConfigDict(
        json_encoders={
            datetime: lambda v: v.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
        }
    )


class ErrorUpdate(BaseModel):
    """Error update from wrapper to backend."""
    type: Literal["error"] = "error"
    session_id: str
    error: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=utc_now)

    model_config = ConfigDict(
        json_encoders={
            datetime: lambda v: v.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
        }
    )


class StatusUpdate(BaseModel):
    """Status update from wrapper to backend."""
    type: Literal["status"] = "status"
    wrapper_id: str
    status: Literal["connected", "disconnected", "ready", "busy"]
    timestamp: datetime = Field(default_factory=utc_now)

    model_config = ConfigDict(
        json_encoders={
            datetime: lambda v: v.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
        }
    )


class CompleteUpdate(BaseModel):
    """Completion update from wrapper to backend."""
    type: Literal["complete"] = "complete"
    session_id: str
    timestamp: datetime = Field(default_factory=utc_now)

    model_config = ConfigDict(
        json_encoders={
            datetime: lambda v: v.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
        }
    )
