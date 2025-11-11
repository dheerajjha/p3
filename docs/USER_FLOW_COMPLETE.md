# Complete User Flow - For Existing Claude Code Users

## Overview

This system adds a beautiful mobile interface to your **existing** Claude Code setup. No duplicate authentication, no new workspaces - just a mobile UI on top of what you already use!

---

## User Profile: Sarah (Typical User)

Sarah is a developer who:
- ✅ Already uses Claude Code via CLI
- ✅ Has `claude` installed globally
- ✅ Is logged in (`~/.claude/credentials.json` exists)
- ✅ Works on a React project at `~/projects/my-app`
- ✅ Has a `CLAUDE.md` file with project context
- ✅ Uses custom slash commands

Sarah wants to access Claude Code from her phone while commuting or away from her desk.

---

## Setup (One-Time, ~10 minutes)

### What Sarah Already Has

```bash
# Sarah's existing setup
cd ~/projects/my-app
cat CLAUDE.md
# Project Context:
# - React app with TypeScript
# - Uses Tailwind CSS
# - Tests in __tests__/

ls ~/.claude/credentials.json
# -rw------- 1 sarah staff 234 Nov 1 10:00 /Users/sarah/.claude/credentials.json

# Sarah's normal workflow
claude
You: Add a button component
Claude: [reads CLAUDE.md, knows it's React + Tailwind + TS]
```

### Step 1: Install Backend (One-Time)

Sarah can either:

**Option A: Cloud Backend (Recommended)**
```bash
# Deploy to fly.io, Railway, or AWS
# One-time setup, always accessible
```

**Option B: Local Backend**
```bash
cd ~/p3/backend
npm install
cp .env.example .env
# Edit .env
npx prisma migrate dev
npm run dev
```

### Step 2: Install Wrapper on Mac (5 minutes)

```bash
cd ~/p3/wrapper
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure (NO API KEY NEEDED!)
cp .env.example .env
nano .env
```

Edit `.env`:
```env
BACKEND_URL=ws://my-backend.fly.dev/wrapper  # or ws://localhost:3000/wrapper
BACKEND_API_KEY=my-secret-key

# NO ANTHROPIC_API_KEY - uses existing Claude Code login!

# Point to Sarah's existing project
WORKSPACE_DIR=/Users/sarah/projects/my-app
WRAPPER_ID=sarahs-mac
```

Start wrapper:
```bash
python main.py
```

Output:
```
INFO - Using Claude Code credentials from ~/.claude/credentials.json
INFO - Authenticated as: sarah@example.com
INFO - Working directory: /Users/sarah/projects/my-app
INFO - Found CLAUDE.md with project context
INFO - Connected to backend: ws://my-backend.fly.dev/wrapper
INFO - Status: ready
```

### Step 3: Install Mobile App (2 minutes)

**Future: From App Store**
```
- Download "Claude Mobile" from App Store
- Open app
```

**Now: Dev build**
```bash
cd ~/p3/mobile
flutter pub get
flutter run
```

---

## Daily Usage

### Morning: Sarah's Commute

**On Mac (before leaving):**
```bash
cd ~/p3/wrapper
source venv/bin/activate
python main.py
# Wrapper running, leave Mac on
```

**On Phone (on train):**

```
┌─────────────────────────┐
│ Opens "Claude Mobile"   │
└─────────────────────────┘
          ↓
┌─────────────────────────┐
│  Welcome back, Sarah!   │
│                         │
│  📁 my-app              │
│  💬 Start new chat      │
└─────────────────────────┘
```

### Use Case 1: Add a Feature

**Sarah types on phone:**
```
"Add a dark mode toggle to the settings page"
```

**What happens:**

```
Phone App
   ↓ WebSocket
Backend (cloud)
   ↓ WebSocket
Wrapper (Mac at home)
   ↓ Uses ~/.claude/credentials.json
Claude SDK
   ↓ Reads CLAUDE.md
Claude: "I see you're using React + Tailwind. I'll add a dark mode toggle..."
```

**Sarah sees on phone:**

```
┌─────────────────────────┐
│ Add a dark mode toggle  │
│ to settings page     👤 │
│                         │
│ ┌────────────────────┐  │
│ │ 🔍 Searching files │  │
│ └────────────────────┘  │
│                         │
│ ┌────────────────────┐  │
│ │ 📖 Reading         │  │
│ │    settings.tsx    │  │
│ └────────────────────┘  │
│                         │
│ ┌────────────────────┐  │
│ │ ✏️ Editing file    │  │
│ └────────────────────┘  │
│                         │
│ 🤖 I've added a dark    │
│    mode toggle! It uses │
│    Tailwind's dark:     │
│    prefix and stores    │
│    preference in        │
│    localStorage.        │
│                         │
│    The toggle is in the │
│    settings page as you │
│    requested.           │
└─────────────────────────┘
```

**Back on Mac later:**
```bash
cd ~/projects/my-app
git status
# modified: src/pages/Settings.tsx
# (changes made via mobile!)

git diff
# + <button onClick={toggleDark}>
# +   Dark Mode
# + </button>
```

### Use Case 2: Quick Code Review

**Colleague shares code snippet:**
```
"Can you review this function?"

def calculate_total(items):
    return sum(item['price'] for item in items)
```

**Sarah types on phone:**
```
"Review this Python function:
def calculate_total(items):
    return sum(item['price'] for item in items)
"
```

**Claude responds (on phone):**
```
┌─────────────────────────┐
│ 🤖 Good start! Here are │
│    some suggestions:    │
│                         │
│    1. Add error         │
│       handling for      │
│       missing 'price'   │
│                         │
│    2. Add type hints    │
│                         │
│    3. Consider using    │
│       Decimal for money │
│                         │
│    Here's an improved   │
│    version:             │
│                         │
│    ```python            │
│    from decimal import  │
│    Decimal              │
│                         │
│    def calculate_total( │
│      items: list[dict]  │
│    ) -> Decimal:        │
│      return sum(        │
│        Decimal(         │
│          item.get(      │
│            'price', 0)  │
│        )                │
│        for item in items│
│      )                  │
│    ```                  │
└─────────────────────────┘
```

### Use Case 3: Debug Production Issue

**2 AM: Production alert on phone**

Sarah doesn't have her laptop, but she has her phone!

**Types on phone:**
```
"Check the latest error logs for the API"
```

**What happens:**

```
Wrapper (running on Mac at home)
   ↓
Claude SDK (using Sarah's auth)
   ↓ bash tool
cd /Users/sarah/projects/my-app
tail -n 50 logs/api.log
```

**Sarah sees:**
```
┌─────────────────────────┐
│ 🤖 I found the error!   │
│                         │
│    The API is failing   │
│    because the database │
│    connection pool is   │
│    exhausted.           │
│                         │
│    Last 10 errors:      │
│    - Pool timeout (x8)  │
│    - Connection refused │
│                         │
│    Quick fix: Restart   │
│    the db connection    │
│    pool. Long-term:     │
│    increase max_conns   │
│    in config.           │
└─────────────────────────┘
```

Sarah can quickly triage and fix!

---

## Key Scenarios

### Scenario 1: Using Existing CLAUDE.md

Sarah's `~/projects/my-app/CLAUDE.md`:
```markdown
# My App Context

## Tech Stack
- React 18 with TypeScript
- Tailwind CSS
- Vitest for testing
- Deployed on Vercel

## Code Style
- Use functional components
- Prefer hooks over classes
- All components in src/components/

## Custom Commands
/test - Run all tests
/deploy - Deploy to Vercel
```

**From phone:**
```
"Add a UserProfile component"
```

**Claude knows:**
- ✅ Use TypeScript (from CLAUDE.md)
- ✅ Use functional component (from CLAUDE.md)
- ✅ Put in src/components/ (from CLAUDE.md)
- ✅ Use Tailwind for styling (from CLAUDE.md)

Same behavior as CLI!

### Scenario 2: Resume Session from CLI

**Morning on desktop:**
```bash
cd ~/projects/my-app
claude

You: Start implementing user authentication
Claude: I'll help with that. First, what auth provider?
You: Use Firebase Auth
Claude: Great! I'll start by installing dependencies...
# Session ID: session-abc123
```

**Later on phone:**
```
"Continue where we left off with authentication"
```

Backend can tell wrapper:
```json
{
  "command": "resume",
  "session_id": "session-abc123"
}
```

Claude continues the conversation!

### Scenario 3: Multiple Projects

Sarah works on multiple projects:
- `~/projects/my-app` (React)
- `~/projects/api-server` (Node.js)
- `~/projects/ml-model` (Python)

**Option 1: Multiple Wrappers**
```bash
# Terminal 1
cd ~/p3/wrapper
WORKSPACE_DIR=~/projects/my-app python main.py

# Terminal 2
cd ~/p3/wrapper-2
WORKSPACE_DIR=~/projects/api-server python main.py
```

**Option 2: Switch Workspace**
From mobile app settings:
```
┌─────────────────────────┐
│ ⚙️ Settings             │
│                         │
│ Active Workspace:       │
│  ▼ my-app              │
│    │ api-server         │
│    │ ml-model           │
│                         │
│ [Switch]                │
└─────────────────────────┘
```

---

## Technical Flow

### Complete Message Flow

```
1. Sarah types on phone: "Add a button"
   Mobile App (UI Thread)
      ↓ setState(isSending: true)

2. Mobile → Backend (HTTP)
   POST /api/chat/send
   {
     "sessionId": "session-xyz",
     "content": "Add a button"
   }

3. Backend saves to PostgreSQL
   INSERT INTO messages (role, content, session_id)
   VALUES ('user', 'Add a button', 'session-xyz')

4. Backend → Wrapper (WebSocket)
   {
     "type": "execute",
     "session_id": "session-xyz",
     "command": "query",
     "payload": {"prompt": "Add a button"}
   }

5. Wrapper receives command
   logger.info("Executing query for session session-xyz")

6. Wrapper → Claude SDK
   ClaudeSDKClient(options)
   # SDK reads ~/.claude/credentials.json
   # SDK reads ~/projects/my-app/CLAUDE.md

7. Claude Agent processes
   - Reads CLAUDE.md: "React + TypeScript + Tailwind"
   - Decides: Need to create Button.tsx
   - Uses 'write' tool

8. Wrapper → Backend (Tool Update)
   {
     "type": "tool_execution",
     "data": {
       "tool_name": "write",
       "friendlyName": "Creating file",
       "icon": "📝",
       "status": "running"
     }
   }

9. Backend → Mobile (WebSocket)
   Forward tool update

10. Mobile displays:
    [📝 Creating file...]

11. Tool completes
    File written: src/components/Button.tsx

12. Wrapper → Backend (Tool Success)

13. Backend → Mobile
    [📝 Creating file ✓]

14. Claude generates response
    "I've created a Button component..."

15. Wrapper → Backend (Message)

16. Backend saves to database
    INSERT INTO messages (role, content)
    VALUES ('assistant', 'I've created...')

17. Backend → Mobile (WebSocket)

18. Mobile displays:
    🤖 "I've created a Button component..."

19. Wrapper → Backend (Complete)

20. Mobile: setState(isSending: false)
```

### Authentication Flow

```
┌─────────────────────────────────────┐
│ Sarah logged into Claude Code       │
│ $ claude login                      │
│ Credentials saved to:               │
│ ~/.claude/credentials.json          │
└──────────────┬──────────────────────┘
               │
               ├─────────────┬─────────────┐
               │             │             │
               ▼             ▼             ▼
         ┌─────────┐   ┌─────────┐   ┌─────────┐
         │ CLI     │   │ Wrapper │   │ SDK     │
         │ claude  │   │ python  │   │ libs    │
         └─────────┘   └─────────┘   └─────────┘
               │             │             │
               └─────────────┴─────────────┘
                            │
                            ▼
          All read ~/.claude/credentials.json
          Same authentication! Same account!
```

---

## Advantages of This Approach

### ✅ Zero Duplicate Setup

**Without mobile wrapper:**
```bash
~/.claude/credentials.json  # CLI auth
ANTHROPIC_API_KEY=sk-...    # API auth (duplicate!)
```

**With mobile wrapper:**
```bash
~/.claude/credentials.json  # One auth for everything!
```

### ✅ Same Project, Same Context

**CLI on desktop:**
```bash
cd ~/projects/my-app
claude
# Reads CLAUDE.md
# Knows project structure
```

**Mobile on phone:**
```
Types: "Add feature"
# Wrapper uses same ~/projects/my-app
# Reads same CLAUDE.md
# Knows same project structure
```

### ✅ Seamless Workflow

```
Morning (Desktop):
$ claude
You: Start implementing auth
# Work for 30 minutes

Lunch (Phone):
"Continue with the auth implementation"
# Picks up where you left off!

Afternoon (Desktop):
$ git status
# See all changes from morning + phone
```

### ✅ No Extra Costs

```
Claude Code CLI:  Uses Sarah's account
Mobile Wrapper:   Uses Sarah's account (same!)
                  ↓
                  Same API usage, same billing
```

---

## Troubleshooting

### "Wrapper can't find credentials"

**Problem:**
```
ERROR - No credentials found at ~/.claude/credentials.json
```

**Solution:**
```bash
# Login to Claude Code first
claude login
# Enter credentials when prompted

# Verify credentials exist
cat ~/.claude/credentials.json

# Restart wrapper
python main.py
```

### "Different files than my CLI sees"

**Problem:** Phone shows different files than desktop CLI

**Solution:**
```bash
# Check wrapper workspace in .env
cat wrapper/.env | grep WORKSPACE_DIR
# WORKSPACE_DIR=/Users/sarah/wrong-project

# Fix it
nano wrapper/.env
# WORKSPACE_DIR=/Users/sarah/projects/my-app

# Restart wrapper
```

### "CLAUDE.md not being read"

**Problem:** Claude doesn't know project context from phone

**Solution:**
```bash
# Verify CLAUDE.md exists in workspace
ls ~/projects/my-app/CLAUDE.md

# Check wrapper logs
tail -f wrapper/wrapper.log
# Should show: "Loaded CLAUDE.md from workspace"

# Verify workspace dir is correct
# Must be PROJECT ROOT, not subdirectory
```

---

## Summary

### For Sarah (Existing Claude Code User)

**Before:**
- ✅ Claude Code on desktop
- ❌ Can't use Claude while mobile

**After:**
- ✅ Claude Code on desktop (same as before)
- ✅ **Plus** beautiful mobile interface
- ✅ Same authentication
- ✅ Same projects
- ✅ Same CLAUDE.md
- ✅ Can resume sessions across devices

### Setup Time
- Backend: 5 min (one-time, or use cloud)
- Wrapper: 5 min (one-time setup)
- Mobile: 2 min (install app)
- **Total: ~12 minutes**

### Daily Use
```bash
# Morning
python ~/p3/wrapper/main.py &
# Done! Use phone all day
```

This is the perfect workflow for existing Claude Code users who want mobile access! 🚀
