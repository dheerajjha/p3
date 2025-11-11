# Revised Setup Guide - Using Existing Claude Code

## Key Insight

**Users already have Claude Code installed and authenticated!** Our wrapper simply uses their existing setup.

## Prerequisites (What Users Already Have)

✅ Claude Code installed: `npm install -g @anthropic-ai/claude-code`
✅ Already logged in: `claude login` (credentials in `~/.claude/credentials.json`)
✅ Working directory/project they use with Claude Code
✅ Optional: CLAUDE.md and custom configurations

## What We're Adding

Just a beautiful mobile interface on top of their existing Claude Code setup!

---

## Simplified Architecture

```
┌─────────────────────────────────────┐
│   Flutter Mobile App                │
│   (Your phone)                      │
└──────────────┬──────────────────────┘
               │ WebSocket/REST
               ▼
┌─────────────────────────────────────┐
│   Backend Server                    │
│   (Cloud or local network)          │
└──────────────┬──────────────────────┘
               │ WebSocket
               ▼
┌─────────────────────────────────────┐
│   Wrapper (Mac)                     │
│   Uses existing Claude Code auth!   │
└──────────────┬──────────────────────┘
               │ SDK (same auth)
               ▼
┌─────────────────────────────────────┐
│   Claude Agent SDK                  │
│   (Uses ~/.claude/credentials.json) │
└─────────────────────────────────────┘
```

---

## Updated Setup (Much Simpler!)

### 1. Wrapper Setup

**No API key needed!** The wrapper uses your existing Claude Code authentication.

Edit `wrapper/config.py`:

```python
class Settings(BaseSettings):
    # Backend configuration
    backend_url: str = "ws://localhost:3000/wrapper"
    backend_api_key: str

    # NO anthropic_api_key needed!
    # SDK uses existing Claude Code auth from ~/.claude/credentials.json

    # Point to your existing project (optional)
    workspace_dir: Path = Path.home() / "your-existing-project"

    # Wrapper configuration
    wrapper_id: str = "wrapper-mac-01"
    log_level: str = "INFO"
```

Edit `wrapper/claude_service.py`:

```python
class ClaudeService:
    def __init__(self):
        self.workspace_dir = Path(settings.workspace_dir)

        # SDK automatically uses existing Claude Code authentication!
        # No api_key parameter needed
        self.options = ClaudeAgentOptions(
            working_directory=str(self.workspace_dir),
            # Will automatically read from ~/.claude/credentials.json
            # Same auth as your Claude Code CLI!
        )
```

### 2. Complete User Flow

#### Day 1: Initial Setup (One-time, 5 minutes)

**On Mac:**

```bash
# 1. Start backend (or use cloud deployment)
cd backend
npm install
npx prisma migrate dev
npm run dev

# 2. Start wrapper (uses existing Claude Code auth!)
cd wrapper
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env - NO API KEY NEEDED!
python main.py

# Output:
# ✓ Using Claude Code credentials from ~/.claude/credentials.json
# ✓ Connected to backend
# ✓ Ready to receive commands
```

**On Phone:**

```bash
# 3. Install mobile app
cd mobile
flutter pub get
flutter run
# or install from App Store (future)

# 4. Register/login
# 5. Start chatting!
```

#### Day 2+: Daily Use

**On Mac:**
```bash
# Just start the wrapper (backend can be cloud)
cd wrapper
source venv/bin/activate
python main.py
```

**On Phone:**
- Open app
- Chat with Claude!
- All your existing project context is available
- CLAUDE.md configurations work
- Custom commands work

---

## How It Actually Works

### Example: User Already Using Claude Code

**Current workflow:**
```bash
cd ~/my-project
claude

You: Create a React component
Claude: [reads CLAUDE.md, knows your project setup]
```

**New workflow with mobile:**
```
Phone App: "Create a React component"
↓
Backend routes to wrapper
↓
Wrapper uses SDK with SAME auth
↓
Claude: [reads SAME CLAUDE.md, knows your project setup]
↓
Response streams back to phone
```

**It's the exact same Claude Code experience, just with a mobile interface!**

---

## Key Advantages

### ✅ For Users Who Already Use Claude Code

1. **Zero new authentication** - Uses existing login
2. **Same workspace** - Point to your current project
3. **Keep CLAUDE.md** - All your configurations work
4. **Custom commands** - Your slash commands available
5. **Session resume** - Can continue existing sessions
6. **No duplicate API costs** - Same account

### ✅ Seamless Integration

```bash
# Terminal 1: Using Claude Code CLI as usual
cd ~/my-project
claude

# Terminal 2: Wrapper running for mobile access
cd ~/p3/wrapper
python main.py

# Both use SAME authentication!
# Both can access SAME workspace!
# No conflicts!
```

---

## Updated .env Files

### wrapper/.env
```env
# Backend connection
BACKEND_URL=ws://localhost:3000/wrapper
BACKEND_API_KEY=your-wrapper-api-key

# NO ANTHROPIC_API_KEY NEEDED!
# Uses existing Claude Code credentials from ~/.claude/credentials.json

# Point to your existing project (optional)
WORKSPACE_DIR=/Users/you/my-existing-project

# Wrapper ID
WRAPPER_ID=wrapper-mac-01
```

### backend/.env (unchanged)
```env
PORT=3000
JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://user:password@localhost:5432/claude_mobile
WRAPPER_API_KEY=your-wrapper-api-key
```

---

## Verification Steps

### 1. Check Existing Claude Code Setup

```bash
# Verify Claude Code is installed
claude --version
# Should show: Claude Code v2.x.x

# Verify you're logged in
ls ~/.claude/credentials.json
# Should exist

# Test it works
cd ~/your-project
echo "Create a hello function" | claude -p
# Should respond
```

### 2. Test Wrapper Uses Same Auth

```bash
cd wrapper
python main.py

# Should see in logs:
# ✓ Loaded credentials from ~/.claude/credentials.json
# ✓ Authenticated as: your-email@example.com
# ✓ Connected to backend
```

### 3. Test from Mobile

```
Open app
Send: "What files are in my project?"

Claude responds with YOUR actual project files!
(because wrapper is using your workspace)
```

---

## Troubleshooting

### "No credentials found"

**Problem:** Wrapper can't find Claude Code credentials

**Solution:**
```bash
# Login to Claude Code first
claude login

# Verify credentials exist
cat ~/.claude/credentials.json

# Try wrapper again
python main.py
```

### "Different workspace than my CLI"

**Problem:** Mobile sees different files than CLI

**Solution:**
```bash
# In wrapper/.env, set to your project directory
WORKSPACE_DIR=/Users/you/your-actual-project

# Restart wrapper
```

### "CLAUDE.md not being read"

**Problem:** Your CLAUDE.md configurations aren't working

**Solution:**
```python
# In wrapper/claude_service.py, verify workspace_dir is correct
self.options = ClaudeAgentOptions(
    working_directory=str(self.workspace_dir),  # Should point to project root
)
```

---

## Advanced: Resume Existing Sessions

You can even resume sessions started in the CLI!

**In CLI:**
```bash
claude
You: Create a function
Claude: [creates function, session ID: session-abc123]
```

**From Mobile:**
```python
# Backend can tell wrapper to resume session
{
  "type": "execute",
  "command": "resume",
  "payload": {
    "session_id": "session-abc123"
  }
}

# User continues conversation from phone!
```

---

## Migration Guide: What Changed

### ❌ Old (Wrong Assumption)
```python
# wrapper/config.py
anthropic_api_key: str  # NEW API key required
workspace_dir: Path = Path.home() / "claude-workspace"  # NEW workspace
```

**Problems:**
- Users need to manage separate API key
- Separate workspace from their existing projects
- Duplicate authentication
- Can't leverage CLAUDE.md

### ✅ New (Correct Approach)
```python
# wrapper/claude_service.py
self.options = ClaudeAgentOptions(
    working_directory="/Users/you/existing-project",
    # Automatically uses ~/.claude/credentials.json
    # Same auth as Claude Code CLI!
)
```

**Benefits:**
- Uses existing authentication
- Access to existing projects
- CLAUDE.md configurations work
- Zero additional setup

---

## Summary

### What Users Need to Do

**If they already use Claude Code:**
1. ✅ Already have Claude Code installed
2. ✅ Already logged in
3. ✅ Already have projects set up
4. ⬜ Install backend (or use cloud)
5. ⬜ Install wrapper (5 minutes)
6. ⬜ Install mobile app
7. ✅ Done!

### What Changes in Our Code

**wrapper/config.py:**
- ❌ Remove `anthropic_api_key` requirement
- ✅ Add note: "Uses existing Claude Code auth"

**wrapper/claude_service.py:**
- ❌ Remove `api_key` parameter
- ✅ SDK auto-detects credentials

**wrapper/README.md:**
- ✅ Add section: "Uses your existing Claude Code authentication"
- ✅ Add verification steps

---

This is SO much better! Users don't need to manage separate API keys or workspaces. They just add a mobile interface to their existing Claude Code setup! 🚀
