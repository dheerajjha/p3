# Getting Started with Claude Code Mobile

This guide will help you set up and run the complete Claude Code Mobile system.

## Prerequisites

Before you begin, ensure you have the following installed:

### For Backend Development
- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14 or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager

### For Wrapper Development
- **Python** 3.10 or higher ([Download](https://www.python.org/downloads/))
- **Node.js** (for Claude Code CLI)
- **Claude Code CLI**: `npm install -g @anthropic-ai/claude-code`

### For Mobile Development
- **Flutter SDK** 3.0 or higher ([Install Guide](https://docs.flutter.dev/get-started/install))
- **Dart SDK** 3.0 or higher (included with Flutter)
- **iOS Development**: Xcode 14+ (Mac only)
- **Android Development**: Android Studio with SDK 21+

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd p3
```

## Step 2: Set Up Backend

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this
DATABASE_URL="postgresql://user:password@localhost:5432/claude_mobile?schema=public"
WRAPPER_API_KEY=your-wrapper-api-key-here
ALLOWED_ORIGINS=http://localhost:*
```

5. Set up PostgreSQL database:
```bash
# Create database
createdb claude_mobile

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

6. Start backend server:
```bash
npm run dev
```

Backend should now be running on `http://localhost:3000`

## Step 3: Set Up Wrapper

1. Navigate to wrapper directory (in new terminal):
```bash
cd wrapper
```

2. Create virtual environment:
```bash
python -m venv venv

# Activate (Mac/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file:
```bash
cp .env.example .env
```

5. Edit `.env` with your configuration:
```env
BACKEND_URL=ws://localhost:3000/wrapper
BACKEND_API_KEY=your-wrapper-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-from-console
WORKSPACE_DIR=/path/to/your/workspace
WRAPPER_ID=wrapper-mac-01
LOG_LEVEL=INFO
```

6. Start wrapper:
```bash
python main.py
```

Wrapper should connect to backend and show "Connected to backend successfully"

## Step 4: Set Up Mobile App

1. Navigate to mobile directory (in new terminal):
```bash
cd mobile
```

2. Install Flutter dependencies:
```bash
flutter pub get
```

3. Configure backend URL:

Edit `lib/services/api_service.dart`:
```dart
static const String baseUrl = 'http://localhost:3000/api';
```

Edit `lib/services/websocket_service.dart`:
```dart
static const String wsUrl = 'ws://localhost:3000/mobile';
```

For iOS simulator, use `http://localhost:3000`
For Android emulator, use `http://10.0.2.2:3000`
For physical device, use your computer's IP address

4. Run the app:
```bash
# List available devices
flutter devices

# Run on specific device
flutter run -d <device-id>

# Or just run (will prompt for device)
flutter run
```

## Step 5: Test the System

1. In the mobile app, register a new account
2. Login with your credentials
3. Send a message: "Create a hello world function in Python"
4. Watch as:
   - Your message appears in the chat
   - Backend receives and routes it
   - Wrapper executes with Claude SDK
   - Tool executions show with icons
   - Response streams back to mobile

## Common Issues

### Backend Issues

**Database connection error:**
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL is correct
psql "postgresql://user:password@localhost:5432/claude_mobile"
```

**Port already in use:**
```bash
# Change PORT in backend/.env
PORT=3001
```

### Wrapper Issues

**Cannot connect to backend:**
- Ensure backend is running first
- Verify BACKEND_URL matches backend PORT
- Check BACKEND_API_KEY matches backend .env

**Claude SDK not found:**
```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Verify installation
claude-code --version
```

**Invalid API key:**
- Get your API key from: https://console.anthropic.com/
- Set ANTHROPIC_API_KEY in wrapper/.env

### Mobile Issues

**Cannot connect to backend:**
- Check backend URL configuration
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For iOS simulator, `localhost` should work
- For physical device, use your computer's IP address

**Build errors:**
```bash
flutter clean
flutter pub get
flutter run
```

**WebSocket connection fails:**
- Ensure backend is running
- Check that WebSocket URL uses `ws://` not `http://`
- Verify authentication token is being sent

## Development Tips

### Hot Reload

- **Flutter**: Press `r` in terminal for hot reload, `R` for hot restart
- **Backend**: Uses nodemon, auto-reloads on file changes
- **Wrapper**: Manual restart needed after code changes

### Debugging

**Backend:**
```bash
# View logs
npm run dev

# Prisma Studio (database GUI)
npx prisma studio
```

**Wrapper:**
```bash
# Increase log verbosity
LOG_LEVEL=DEBUG python main.py

# View logs
tail -f wrapper.log
```

**Mobile:**
```bash
# Run with verbose logging
flutter run -v

# View logs
flutter logs
```

### Database Management

**View data:**
```bash
npx prisma studio
```

**Reset database:**
```bash
npx prisma migrate reset
```

**Create new migration:**
```bash
npx prisma migrate dev --name description
```

## Next Steps

- Read [ARCHITECTURE.md](../ARCHITECTURE.md) for system design
- Explore backend API at `http://localhost:3000/health`
- Check individual component READMEs for detailed documentation
- Start building your own features!

## Getting Help

- Check documentation in `docs/`
- Review component-specific READMEs
- Create an issue for bugs or questions
- Review ARCHITECTURE.md for design decisions
