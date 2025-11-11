# Claude Code Wrapper

Agnostic wrapper for Claude Agent SDK that connects to the backend server.

## Overview

This wrapper acts as a bridge between your backend server and the Claude Agent SDK. It:
- Connects to your backend via WebSocket
- Receives execution commands from the backend
- **Uses your existing Claude Code authentication** (no separate API key needed!)
- Wraps Claude Agent SDK and executes queries
- Works with your existing projects and CLAUDE.md configurations
- Streams all updates back to the backend in real-time
- Handles reconnection automatically

## Key Feature: Uses Existing Claude Code Setup

**No need for a separate Anthropic API key!** The wrapper automatically uses the same credentials as your Claude Code CLI from `~/.claude/credentials.json`.

## Installation

### Prerequisites

- Python 3.10 or higher
- **Claude Code already installed**: `npm install -g @anthropic-ai/claude-code`
- **Already logged in to Claude Code**: Run `claude login` (you probably did this already!)
  - This creates `~/.claude/credentials.json` which the wrapper will use

### Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Mac/Linux
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Configuration

Edit `.env` file:

```env
# Backend server WebSocket URL
BACKEND_URL=ws://localhost:3000/wrapper

# Backend API key for authentication
BACKEND_API_KEY=your-backend-api-key

# NO ANTHROPIC_API_KEY NEEDED!
# Wrapper automatically uses your existing Claude Code credentials
# from ~/.claude/credentials.json

# Workspace directory - point to your existing project!
# This can be the same directory where you normally use Claude Code
WORKSPACE_DIR=/Users/yourname/your-existing-project

# Unique wrapper identifier
WRAPPER_ID=wrapper-mac-01
```

### Verify Your Claude Code Setup

Before running the wrapper, verify your existing Claude Code setup:

```bash
# Check Claude Code is installed
claude --version

# Verify you're logged in (should show credentials)
ls -la ~/.claude/credentials.json

# Test it works
cd /path/to/your/project
echo "List files" | claude -p
```

## Usage

### Start the wrapper:

```bash
python main.py
```

The wrapper will:
1. Connect to the backend server
2. Send a "connected" status update
3. Wait for execution commands
4. Execute commands and stream results
5. Automatically reconnect if connection drops

### Run as a service (macOS):

Create a launchd plist file at `~/Library/LaunchAgents/com.claudecode.wrapper.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.claudecode.wrapper</string>
    <key>ProgramArguments</key>
    <array>
        <string>/path/to/venv/bin/python</string>
        <string>/path/to/wrapper/main.py</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/path/to/wrapper</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/path/to/wrapper/stdout.log</string>
    <key>StandardErrorPath</key>
    <string>/path/to/wrapper/stderr.log</string>
</dict>
</plist>
```

Load the service:
```bash
launchctl load ~/Library/LaunchAgents/com.claudecode.wrapper.plist
```

## Communication Protocol

### Commands from Backend

**Execute Query:**
```json
{
  "type": "execute",
  "session_id": "uuid-here",
  "command": "query",
  "payload": {
    "prompt": "Create a hello world function in Python"
  }
}
```

**Stop Execution:**
```json
{
  "type": "execute",
  "session_id": "uuid-here",
  "command": "stop",
  "payload": {}
}
```

### Updates to Backend

**Status Update:**
```json
{
  "type": "status",
  "wrapper_id": "wrapper-mac-01",
  "status": "ready",
  "timestamp": "2025-11-11T10:00:00Z"
}
```

**Message Update:**
```json
{
  "type": "message",
  "session_id": "uuid-here",
  "data": {
    "role": "assistant",
    "content": "I'll create a hello world function for you...",
    "type": "text"
  },
  "timestamp": "2025-11-11T10:00:01Z"
}
```

**Tool Execution Update:**
```json
{
  "type": "tool_execution",
  "session_id": "uuid-here",
  "data": {
    "type": "tool",
    "tool_name": "write",
    "status": "running",
    "tool_input": {"file_path": "hello.py", "content": "..."}
  },
  "timestamp": "2025-11-11T10:00:02Z"
}
```

**Error Update:**
```json
{
  "type": "error",
  "session_id": "uuid-here",
  "error": "Error message",
  "details": {},
  "timestamp": "2025-11-11T10:00:03Z"
}
```

**Completion Update:**
```json
{
  "type": "complete",
  "session_id": "uuid-here",
  "timestamp": "2025-11-11T10:00:10Z"
}
```

## Architecture

```
┌─────────────────────────────┐
│   main.py                   │
│   - WebSocket client        │
│   - Command handling        │
│   - Reconnection logic      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│   claude_service.py         │
│   - Claude SDK wrapper      │
│   - Query execution         │
│   - Message streaming       │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│   Claude Agent SDK          │
└─────────────────────────────┘
```

## Logging

Logs are written to:
- Console (stdout)
- `wrapper.log` file

Log level can be configured in `.env`:
```env
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
```

## Troubleshooting

### Connection Issues

If the wrapper can't connect to the backend:
1. Check that the backend server is running
2. Verify `BACKEND_URL` in `.env`
3. Check firewall settings
4. Review logs for detailed error messages

### Claude SDK Errors

If you see Claude SDK errors:
1. Verify `ANTHROPIC_API_KEY` is correct
2. Check that Claude Code is installed: `npm list -g @anthropic-ai/claude-code`
3. Ensure workspace directory exists and has write permissions

### Reconnection

The wrapper automatically reconnects with exponential backoff:
- Initial delay: 5 seconds
- Max attempts: 10
- Delay increases with each attempt

## Development

### Running Tests

```bash
pytest tests/
```

### Code Style

This project uses:
- Black for formatting
- Pylint for linting
- Type hints throughout

Format code:
```bash
black .
pylint wrapper/
```

## License

MIT
