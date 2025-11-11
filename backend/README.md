# Claude Mobile Backend

Central backend server that acts as an intermediary between the Flutter mobile app and the Claude Code wrapper.

## Overview

This backend server:
- Manages user authentication and sessions
- Provides REST API for mobile app
- Handles WebSocket connections from both mobile and wrapper
- Routes messages between mobile and wrapper
- Persists chat history and sessions
- Provides beginner-friendly error messages

## Architecture

```
Mobile App (WebSocket) → Backend → Wrapper (WebSocket)
     ↓                      ↓              ↓
  REST API            PostgreSQL     Claude SDK
```

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up database:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Start server:
```bash
# Development
npm run dev

# Production
npm start
```

## Configuration

Edit `.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# JWT secret (change in production!)
JWT_SECRET=your-secret-here

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/claude_mobile"

# Wrapper API key (must match wrapper configuration)
WRAPPER_API_KEY=your-wrapper-api-key

# CORS
ALLOWED_ORIGINS=http://localhost:*,https://yourdomain.com
```

## API Endpoints

### Authentication

**Register:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Login:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Get Current User:**
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Chat

**Send Message:**
```http
POST /api/chat/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "optional-uuid",
  "content": "Create a hello world function"
}
```

**Get Sessions:**
```http
GET /api/chat/sessions
Authorization: Bearer <token>
```

**Get Chat History:**
```http
GET /api/chat/history/:sessionId
Authorization: Bearer <token>
```

**Create Session:**
```http
POST /api/chat/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Project"
}
```

**Delete Session:**
```http
DELETE /api/chat/sessions/:sessionId
Authorization: Bearer <token>
```

## WebSocket Connections

### Mobile Client

Connect to: `ws://localhost:3000/mobile`

Headers:
```
Authorization: Bearer <jwt-token>
```

**Receive Messages:**
```json
{
  "sessionId": "uuid",
  "type": "message",
  "data": {
    "role": "assistant",
    "content": "I'll help you with that...",
    "type": "text"
  }
}
```

**Receive Tool Execution:**
```json
{
  "sessionId": "uuid",
  "type": "tool_execution",
  "data": {
    "tool_name": "write",
    "friendlyName": "Creating file",
    "icon": "📝",
    "status": "running"
  }
}
```

**Receive Error:**
```json
{
  "sessionId": "uuid",
  "type": "error",
  "message": "Oops! I couldn't find that file."
}
```

**Receive Complete:**
```json
{
  "sessionId": "uuid",
  "type": "complete"
}
```

### Wrapper Client

Connect to: `ws://localhost:3000/wrapper`

Headers:
```
Authorization: Bearer <wrapper-api-key>
X-Wrapper-ID: wrapper-mac-01
```

**Receive Commands:**
```json
{
  "type": "execute",
  "session_id": "uuid",
  "command": "query",
  "payload": {
    "prompt": "Create a hello world function"
  }
}
```

## Database Schema

### Users Table
- id (UUID)
- email (unique)
- password (hashed)
- name
- createdAt
- updatedAt

### Sessions Table
- id (UUID)
- userId (FK)
- title
- createdAt
- updatedAt

### Messages Table
- id (UUID)
- sessionId (FK)
- role (user/assistant/system)
- content
- metadata (JSON)
- createdAt

### WrapperConnections Table
- id (UUID)
- wrapperId (unique)
- status
- lastPing
- metadata (JSON)
- createdAt
- updatedAt

## Error Handling

The backend translates technical errors into friendly messages:

- File not found → "Oops! I couldn't find that file."
- Permission error → "I don't have permission to do that."
- Timeout → "This is taking longer than expected. Let's try again."
- Generic error → "Something went wrong. Let me try a different approach."

## Security

- JWT authentication for mobile clients
- API key authentication for wrappers
- HTTPS in production
- CORS configuration
- Rate limiting
- SQL injection prevention (Prisma)
- Password hashing (bcrypt)

## Development

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

### Database Migrations
```bash
# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

### Prisma Studio (Database GUI)
```bash
npx prisma studio
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables (Production)

Ensure these are set in production:
- `NODE_ENV=production`
- Strong `JWT_SECRET`
- Strong `WRAPPER_API_KEY`
- Proper `DATABASE_URL`
- Correct `ALLOWED_ORIGINS`

## Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### Logs

Logs include:
- Request/response logging
- WebSocket connections
- Error tracking
- Wrapper status updates

In production, pipe logs to a logging service:
```bash
npm start | tee -a server.log
```

## License

MIT
