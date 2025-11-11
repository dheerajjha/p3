# Quick Start - For Existing Claude Code Users

You already have Claude Code set up! This just adds a mobile interface.

## What You Already Have ✅

- Claude Code installed: `claude --version`
- Already logged in: `~/.claude/credentials.json` exists
- Project directory where you use Claude Code
- Optional: CLAUDE.md configurations

## 5-Minute Setup

### 1. Start Wrapper (on Mac)

```bash
cd wrapper
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure (no API key needed!)
cp .env.example .env
nano .env
# Set:
#   BACKEND_URL=ws://localhost:3000/wrapper
#   BACKEND_API_KEY=any-secret-key
#   WORKSPACE_DIR=/Users/you/your-project  # Your existing project!

# Run
python main.py
```

**Output:**
```
INFO - Using Claude Code credentials from ~/.claude/credentials.json
INFO - Connected to backend
INFO - Ready to receive commands
```

### 2. Start Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with database URL and wrapper key
npx prisma migrate dev
npm run dev
```

### 3. Use Mobile App

```bash
cd mobile
flutter pub get
# Edit lib/services/*.dart with backend URL
flutter run
```

**That's it!** Your mobile app now uses your existing Claude Code setup.

## Verification

**Test in CLI:**
```bash
cd ~/your-project
claude
You: List files in this directory
```

**Test from mobile:**
```
Open app → Send: "List files in this directory"
```

**Both should show the same files!** Because they use:
- Same authentication
- Same workspace
- Same CLAUDE.md

## Key Benefits

✅ No separate API key needed
✅ Uses your existing project
✅ CLAUDE.md configurations work
✅ Custom slash commands available
✅ Can resume CLI sessions from mobile
✅ Zero duplicate costs

## Next Steps

- Read [REVISED_SETUP.md](./REVISED_SETUP.md) for details
- See [GETTING_STARTED.md](./GETTING_STARTED.md) for full guide
- Check [ARCHITECTURE.md](../ARCHITECTURE.md) for system design
