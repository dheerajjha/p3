# Claude Code Mobile - Monorepo

A beautiful, beginner-friendly mobile interface for Claude Code with a three-tier architecture.

## Overview

This monorepo contains a complete system for interacting with Claude AI through a mobile app:

- **Mobile App** (Flutter): Beautiful, intuitive UI that abstracts technical complexity
- **Backend Server** (Node.js): Central hub for authentication, routing, and state management
- **Wrapper** (Python): Agnostic bridge between backend and Claude Agent SDK

```
┌─────────────────────────────────────┐
│   Flutter Mobile App                │
│   📱 iOS & Android                  │
└──────────────┬──────────────────────┘
               │ REST API + WebSocket
               ▼
┌─────────────────────────────────────┐
│   Backend Server                    │
│   🔄 Node.js + PostgreSQL           │
└──────────────┬──────────────────────┘
               │ WebSocket
               ▼
┌─────────────────────────────────────┐
│   Claude Code Wrapper               │
│   🔧 Python + Claude Agent SDK      │
└──────────────┬──────────────────────┘
               │ SDK
               ▼
┌─────────────────────────────────────┐
│   Claude Agent SDK                  │
│   🤖 AI-powered coding assistant    │
└─────────────────────────────────────┘
```

## Features

### Mobile App
- 🎨 Beautiful, modern UI with smooth animations
- 👶 Beginner-friendly language (no technical jargon)
- 💬 Chat-like interface (similar to ChatGPT)
- 🎭 Dark/light themes
- 📝 Markdown and code highlighting
- 🔄 Real-time streaming responses
- 🎯 Visual tool execution indicators

### Backend Server
- 🔐 JWT authentication
- 💾 PostgreSQL database for persistence
- 🔌 WebSocket for real-time communication
- 🛡️ Rate limiting and security
- 📊 Session management
- 🔄 Message routing between mobile and wrapper

### Wrapper
- 🌉 Agnostic bridge to Claude SDK
- 🔌 WebSocket connection to backend
- 📡 Real-time update streaming
- 🔄 Automatic reconnection
- 🛠️ Tool execution handling
- 📁 Workspace management

## Quick Start

### Prerequisites

- **Mobile**: Flutter 3.0+, Dart 3.0+
- **Backend**: Node.js 18+, PostgreSQL
- **Wrapper**: Python 3.10+, Claude Code CLI

### 1. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npx prisma migrate dev
npm run dev
```

### 2. Setup Wrapper (on Mac)

```bash
cd wrapper
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python main.py
```

### 3. Setup Mobile

```bash
cd mobile
flutter pub get
# Update backend URL in lib/services/*
flutter run
```

## Project Structure

```
p3/
├── mobile/                 # Flutter mobile app
│   ├── lib/
│   │   ├── main.dart
│   │   ├── models/
│   │   ├── providers/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── theme/
│   │   └── widgets/
│   └── pubspec.yaml
│
├── backend/                # Node.js backend server
│   ├── src/
│   │   ├── index.js
│   │   ├── config.js
│   │   ├── schemas.js
│   │   ├── routes/
│   │   ├── services/
│   │   ├── websocket/
│   │   └── plugins/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
├── wrapper/                # Claude Code wrapper
│   ├── main.py
│   ├── config.py
│   ├── models.py
│   ├── claude_service.py
│   └── requirements.txt
│
├── shared/                 # Shared types/models (future)
├── docs/                   # Documentation
├── ARCHITECTURE.md         # Architecture documentation
└── README.md              # This file
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Configuration

### Backend (.env)
```env
PORT=3000
JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://user:password@localhost:5432/claude_mobile
WRAPPER_API_KEY=your-wrapper-key
```

### Wrapper (.env)
```env
BACKEND_URL=ws://localhost:3000/wrapper
BACKEND_API_KEY=your-wrapper-key
ANTHROPIC_API_KEY=your-anthropic-key
WORKSPACE_DIR=/path/to/workspace
```

### Mobile
Update URLs in:
- `lib/services/api_service.dart`
- `lib/services/websocket_service.dart`

## Development Workflow

### Running All Services

Terminal 1 - Backend:
```bash
cd backend && npm run dev
```

Terminal 2 - Wrapper:
```bash
cd wrapper && python main.py
```

Terminal 3 - Mobile:
```bash
cd mobile && flutter run
```

## API Flow

1. User types message in mobile app
2. Mobile → Backend (POST /api/chat/send)
3. Backend saves to database
4. Backend → Wrapper (WebSocket: execute command)
5. Wrapper → Claude SDK (Python SDK)
6. Claude streams responses
7. Wrapper → Backend (WebSocket: updates)
8. Backend → Mobile (WebSocket: updates)
9. Mobile renders with beautiful UI

## UI/UX Philosophy

**Beginner-Friendly Language:**
- ❌ "Tool execution: bash"
- ✅ "Running your code..."

- ❌ "File write operation failed"
- ✅ "Oops! Couldn't save the file. Let me try again."

**Visual Elements:**
- 📝 Icons for different actions
- 🎨 Color-coded messages
- ⏳ Progress indicators
- ✨ Smooth animations

## Security

- 🔐 JWT authentication for mobile
- 🔑 API key authentication for wrapper
- 🔒 HTTPS in production
- 🛡️ Rate limiting
- 🚫 Input validation
- 💾 Secure token storage
- 🔐 Password hashing

## Deployment

### Mobile
- Build for iOS/Android
- Distribute via App Store / Play Store
- Configure production backend URL

### Backend
- Deploy to cloud (AWS/GCP/Azure)
- Use managed PostgreSQL
- Set environment variables
- Enable HTTPS

### Wrapper
- Run locally on Mac
- Use launchd for auto-start
- Connect to cloud backend

## Testing

### Backend
```bash
cd backend
npm test
```

### Wrapper
```bash
cd wrapper
pytest tests/
```

### Mobile
```bash
cd mobile
flutter test
```

## Documentation

- [Architecture](./ARCHITECTURE.md) - Detailed architecture documentation
- [Mobile README](./mobile/README.md) - Flutter app documentation
- [Backend README](./backend/README.md) - Backend server documentation
- [Wrapper README](./wrapper/README.md) - Wrapper documentation

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Submit a pull request

## Roadmap

### Phase 1 (Current)
- [x] Mobile app with beautiful UI
- [x] Backend server with WebSocket
- [x] Wrapper for Claude SDK
- [x] Basic chat functionality

### Phase 2
- [ ] Voice input/output
- [ ] File browser in mobile
- [ ] Code snippet sharing
- [ ] Session history
- [ ] Push notifications

### Phase 3
- [ ] Offline mode with sync
- [ ] Multi-user collaboration
- [ ] Custom tool plugins
- [ ] Analytics dashboard
- [ ] Desktop app

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Run migrations: `npx prisma migrate dev`

### Wrapper can't connect
- Ensure backend is running
- Check BACKEND_URL in wrapper .env
- Verify WRAPPER_API_KEY matches backend

### Mobile can't connect
- Check backend URL in services
- Ensure backend is accessible
- Verify authentication token

## License

MIT

## Support

For issues and questions:
- Create an issue in the repository
- Check documentation in docs/
- Review ARCHITECTURE.md for design details

## Credits

Built with:
- [Flutter](https://flutter.dev/) - Mobile framework
- [Fastify](https://fastify.dev/) - Backend framework
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk-python) - AI SDK
- [Prisma](https://www.prisma.io/) - Database ORM
- [Riverpod](https://riverpod.dev/) - State management

---

Made with ❤️ for the Claude community
