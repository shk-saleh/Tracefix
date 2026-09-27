# TRACEFIX

**Evidence-Driven Autonomous Debugging Platform**

TRACEFIX traces the cause, fixes the bug, and verifies the result — completely automatically.

```
GitHub OAuth → Repository List → Select Repository → Investigation → Docker → AI → Fix → Report
```

---

## Quick Start

### Prerequisites

- Node.js 22+
- Docker Desktop (running)
- Ollama (optional, for AI debugging)
- A GitHub OAuth Application

---

### 1. GitHub OAuth Setup

1. Go to [github.com/settings/apps](https://github.com/settings/apps) or [github.com/settings/developers](https://github.com/settings/developers)
2. Create a new **OAuth App**
3. Set **Homepage URL** to `http://localhost:3000`
4. Set **Authorization callback URL** to `http://localhost:3000/api/auth/github/callback`
5. Copy your **Client ID** and **Client Secret**

---

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# Generate a secure secret:
# openssl rand -hex 32
SESSION_SECRET=your_32_byte_secret

RUNNER_MODE=local
DOCKER_NETWORK_DISABLED=true
DOCKER_MEMORY_LIMIT=2048m
DOCKER_CPU_LIMIT=2

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

---

### 3. Docker Setup

```bash
# Build the runner image
npm run docker:build

# Verify Docker is running
docker info
```

---

### 4. Ollama Setup (Optional)

```bash
# Install Ollama from https://ollama.ai
ollama pull llama3.2
ollama serve
```

The AI investigation pipeline is skipped gracefully if Ollama is unavailable.

---

### 5. Start the Application

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

### 6. Testing the Full Flow

1. Open TRACEFIX at http://localhost:3000
2. Click **Connect GitHub** (or visit `/api/auth/github/login`)
3. Authorize the GitHub OAuth application
4. Browse your repositories at `/repositories`
5. Select a repository → enter a bug description → **Start Investigation**
6. Watch the investigation progress in real time at `/investigations/[id]`
7. View completed investigation reports at `/reports`

---

### 7. Local vs Cloud Runner

**Local (default):**
```env
RUNNER_MODE=local
```
Uses Docker Desktop. Each investigation runs in an isolated container.

**Cloud:**
```env
RUNNER_MODE=cloud
CLOUD_RUNNER_URL=https://your-runner.example.com
CLOUD_RUNNER_TOKEN=your_secret_token
```
Delegates to a remote runner service. The frontend is identical — only the backend changes.

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run typecheck    # TypeScript type check
npm run docker:build # Build the runner Docker image
```

---

## Security Model

- GitHub access tokens are stored in HTTP-only signed cookies — never exposed to the browser
- Repository code runs in isolated Docker containers with memory/CPU limits
- Network is disabled by default during test execution
- Only allowlisted commands can run inside containers
- Session secrets are never logged or returned to the client

---

## Architecture

```
Browser
  ↓
Next.js App Router
  ├── GitHub OAuth  (/api/auth/github/*)
  ├── GitHub API    (/api/github/*)
  ├── Investigations (/api/investigations/*)
  ├── Runner Status (/api/runner/status)
  └── AI Status     (/api/ai/status)
       ↓
  Service Layer (src/lib/)
  ├── Session Management (jose JWT)
  ├── GitHub Client (Octokit)
  ├── Investigation Store (.data/investigations.json)
  ├── Runner Factory
  │   ├── LocalDockerRunner
  │   └── CloudRunner
  └── AI Agent (Ollama)
       ↓
  Docker Container (tracefix-runner)
  ├── git clone
  ├── npm install / pnpm install / yarn install
  ├── Project detection
  ├── Baseline tests
  └── AI-directed test/patch/verify
```

---

## Documentation

- [Architecture](docs/architecture.md)
- [Local Development](docs/local-development.md)
