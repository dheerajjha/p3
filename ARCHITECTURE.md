# Claude Code Mobile - Monorepo Architecture

## Overview

A beautiful, beginner-friendly mobile interface for Claude Code with a three-tier architecture:

```
┌─────────────────────────────────────┐
│   Flutter Mobile App                │
│   Beautiful UI for beginners        │
│   - Simple chat interface           │
│   - Abstract technical details      │
│   - Visual feedback                 │
└──────────────┬──────────────────────┘
               │ REST/WebSocket
               │ (HTTPS)
               ▼
┌─────────────────────────────────────┐
│   Backend Server                    │
│   Intermediary & Business Logic     │
│   - Authentication                  │
│   - Session management              │
│   - Message routing                 │
│   - State persistence               │
└──────────────┬──────────────────────┘
               │ REST/WebSocket
               │ (Internal network)
               ▼
┌─────────────────────────────────────┐
│   Claude Code Wrapper (Mac)         │
│   Agnostic SDK Bridge               │
│   - Connects to backend             │
│   - Wraps Claude Agent SDK          │
│   - Streams updates to backend      │
│   - Receives commands from backend  │
└──────────────┬──────────────────────┘
               │ Python SDK
               ▼
┌─────────────────────────────────────┐
│   Claude Agent SDK                  │
└─────────────────────────────────────┘
```

## Monorepo Structure

```
p3/
├── mobile/                 # Flutter mobile app
├── backend/                # Node.js/Python backend server
├── wrapper/                # Claude Code wrapper (Mac)
├── shared/                 # Shared types/models
├── docs/                   # Documentation
├── ARCHITECTURE.md         # This file
├── README.md              # Project overview
└── docker-compose.yml     # Optional: for backend services
```

## Component Responsibilities

### 1. Mobile App (Flutter)
**Purpose:** Beautiful, beginner-friendly UI that abstracts all technical complexity

**Key Features:**
- Chat-like interface (like ChatGPT/WhatsApp)
- Simple, conversational interactions
- Visual indicators for actions (no technical jargon)
- Friendly error messages
- Smooth animations and transitions
- Dark/light themes
- Accessible design

**User Experience:**
- "Ask me anything" approach
- No need to understand tools, files, or commands
- Visual representations (file icons, progress bars)
- Natural language throughout
- Onboarding tutorial for beginners

### 2. Backend Server
**Purpose:** Central hub for routing, authentication, and state management

**Key Features:**
- User authentication & authorization
- Session persistence (database)
- Message queue management
- WebSocket connections to both mobile and wrapper
- Rate limiting & security
- Logging & analytics
- API gateway pattern

**Technology:** Node.js (Express/Fastify) or Python (FastAPI)

### 3. Claude Code Wrapper (Mac)
**Purpose:** Agnostic bridge between backend and Claude Agent SDK

**Key Features:**
- Stateless design (backend manages state)
- Receives commands from backend via WebSocket
- Streams all Claude updates to backend
- Wraps Claude Agent SDK
- Handles tool execution
- File system operations in workspace
- No business logic (pure wrapper)

**Communication Protocol:**
```json
// Backend → Wrapper: Execute command
{
  "type": "execute",
  "sessionId": "uuid",
  "command": "query",
  "payload": {
    "prompt": "Create a hello world function"
  }
}

// Wrapper → Backend: Stream updates
{
  "type": "message",
  "sessionId": "uuid",
  "data": {
    "role": "assistant",
    "content": "I'll create that for you..."
  }
}

{
  "type": "tool_execution",
  "sessionId": "uuid",
  "data": {
    "tool": "write_file",
    "status": "running",
    "file": "hello.py"
  }
}
```

## UI/UX Design Philosophy

### Beginner-Friendly Approach

**Instead of technical terms, use friendly language:**
- ❌ "Tool execution: bash"
- ✅ "Running your code..."

- ❌ "File write operation failed"
- ✅ "Oops! Couldn't save the file. Let me try again."

- ❌ "Context limit exceeded"
- ✅ "This conversation is getting long. Start a new chat?"

**Visual Elements:**
- Avatars for user and AI
- Typing indicators with animations
- Progress bars for long operations
- Icons for different actions (📝 writing, 🔍 searching, 🏃 running)
- Color-coded message types
- Smooth scroll animations

**Simplified Concepts:**
- "Workspace" instead of "working directory"
- "Projects" instead of "repositories"
- "Fix" instead of "debug/refactor"
- "Ask Claude" instead of "query agent"

## Data Flow

### Message Flow (User sends message)
```
1. User types in mobile app
2. Mobile → Backend (POST /messages)
3. Backend validates, stores in DB
4. Backend → Wrapper (WebSocket: execute command)
5. Wrapper → Claude SDK (Python SDK)
6. Claude SDK streams responses
7. Wrapper → Backend (WebSocket: stream updates)
8. Backend → Mobile (WebSocket: stream to user)
9. Mobile renders in beautiful UI
```

### State Management
- **Mobile:** Local state (Riverpod/Bloc) + Server sync
- **Backend:** Single source of truth (PostgreSQL/MongoDB)
- **Wrapper:** Stateless, receives all context from backend

## Technology Stack

### Mobile (Flutter)
```yaml
dependencies:
  flutter: sdk: flutter
  riverpod: ^2.4.0              # State management
  dio: ^5.4.0                   # HTTP client
  web_socket_channel: ^2.4.0   # WebSocket
  flutter_secure_storage: ^9.0.0  # Secure storage
  flutter_markdown: ^0.6.18     # Markdown rendering
  flutter_animate: ^4.3.0       # Animations
  google_fonts: ^6.1.0          # Beautiful fonts
  fl_chart: ^0.65.0             # Charts (optional)
```

### Backend (Node.js)
```json
{
  "dependencies": {
    "fastify": "^4.25.0",
    "fastify-websocket": "^10.0.0",
    "@fastify/jwt": "^7.2.0",
    "prisma": "^5.7.0",
    "ioredis": "^5.3.0",
    "zod": "^3.22.0"
  }
}
```

### Wrapper (Python)
```python
# requirements.txt
claude-sdk>=0.1.6
fastapi>=0.108.0
websockets>=12.0
pydantic>=2.5.0
python-dotenv>=1.0.0
aiohttp>=3.9.0
```

## Security

### Mobile
- Secure token storage (flutter_secure_storage)
- Certificate pinning
- No hardcoded secrets
- Biometric authentication option

### Backend
- JWT authentication
- HTTPS only
- CORS configuration
- Rate limiting
- Input validation (Zod/Pydantic)
- SQL injection prevention
- XSS protection

### Wrapper
- API key in environment variables
- Sandboxed workspace
- No direct internet access (only backend communication)
- File operation restrictions

## Development Workflow

```bash
# Start backend
cd backend
npm install
npm run dev

# Start wrapper (on Mac)
cd wrapper
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py

# Start mobile (development)
cd mobile
flutter pub get
flutter run
```

## Deployment

### Mobile
- iOS: App Store
- Android: Play Store
- Configuration: Server URL in app settings

### Backend
- Cloud: AWS/GCP/Azure
- Docker container
- Database: Managed PostgreSQL
- Environment variables for config

### Wrapper
- Runs locally on Mac
- systemd/launchd for auto-start
- Connects to backend via configured URL
- Workspace directory configuration

## Future Enhancements

1. **Mobile:**
   - Voice input/output
   - Offline mode with sync
   - Multi-workspace support
   - Code snippet sharing
   - Tutorials & guided tours

2. **Backend:**
   - Multi-user collaboration
   - Usage analytics dashboard
   - A/B testing infrastructure
   - Webhook support

3. **Wrapper:**
   - Multiple Claude instances
   - Custom tool plugins
   - Performance monitoring
   - Auto-recovery mechanisms
