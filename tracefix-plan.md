# TRACEFIX — Frontend Build Plan

## Top-Level Overview

Build the complete frontend for TRACEFIX, an AI-powered evidence-driven debugging platform,
on a blank Next.js 15 (App Router) project. The UI is a professional, dark-theme, developer-
focused SaaS product targeting desktop. The stack is: Next.js 15, TypeScript, Tailwind CSS,
shadcn/ui, Framer Motion, Lucide React, Monaco Editor.

**Scope:**
- Fully build: Landing Page, Dashboard (full investigation flow)
- Stub: Investigation History page, Final Report page
- All API calls target Next.js Route Handlers (/api); no real backend in MVP
- Polling pattern (`/api/investigate/status`) for live investigation state updates
- No simulated animations — components show loading/empty/error states properly
- Mock fixtures used only as dev data shapes (not for auto-play animation)
- Evidence Drawer: slide-in overlay from the right (does not push content)
- Code Diff: unified single-pane, inline GitHub-style +/- Monaco view

**Non-goals:**
- No authentication / auth pages
- No mobile layout (desktop-first only)
- No real backend implementation (API routes return fixture shapes only)

---

## Sub-Task 1 — Project Bootstrap

**Intent:** Scaffold the Next.js 15 project with all required dependencies and global config so
every subsequent sub-task has a working foundation.

**Expected Outcomes:**
- `package.json` exists with all dependencies installed
- `tailwind.config.ts` is configured with the TRACEFIX color palette and custom tokens
- `tsconfig.json` is strict-mode TypeScript
- `globals.css` sets the dark base, font, and CSS custom properties
- `components.json` (shadcn/ui) is initialized
- `next.config.ts` is minimal and correct for App Router
- `app/layout.tsx` sets the root HTML shell (dark background, Inter font)
- Project runs (`npm run dev`) with no errors

**Todo List:**
1. Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` inside the workspace root
2. Install runtime dependencies: `framer-motion lucide-react @monaco-editor/react react-flow-renderer`
3. Initialize shadcn/ui: `npx shadcn@latest init` (choose dark theme, slate base, CSS variables)
4. Add shadcn components needed: `button input textarea badge card separator scroll-area drawer`
5. Configure `tailwind.config.ts` — extend colors with:
   - `background`: `#0a0a0f` (deep dark)
   - `surface`: `#111118` (card surface)
   - `surface-2`: `#1a1a24` (elevated card)
   - `border`: `#1e1e2e`
   - `accent`: `#2563eb` (IBM Blue)
   - `accent-hover`: `#1d4ed8`
   - `success`: `#22c55e`
   - `warning`: `#f59e0b`
   - `error`: `#ef4444`
   - `muted`: `#6b7280`
   - `muted-foreground`: `#9ca3af`
6. Set `globals.css`: dark scrollbar, base font-family (Inter), `::selection` color, CSS vars
7. Create `app/layout.tsx` with html `dark` class, Inter font, and metadata for TRACEFIX
8. Create stub `app/page.tsx` (empty export) to unblock other sub-tasks
9. Create stub API route `app/api/investigate/status/route.ts` returning a fixture JSON shape

**Relevant Context:**
- Workspace root: `c:\Users\hp\Tracefix`
- Stack: Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui
- shadcn docs pattern: `components/ui/` for generated primitives

**Status:** [ ] pending

---

## Sub-Task 2 — Global Layout & Navigation Shell

**Intent:** Build the application shell — the persistent top navbar and the three-column
dashboard layout — so all pages share a consistent chrome.

**Expected Outcomes:**
- `components/layout/Navbar.tsx` — top bar with TRACEFIX logo, nav links, and a user avatar slot
- `components/layout/Sidebar.tsx` — left sidebar with nav items: Dashboard, Repositories,
  Investigations, Reports, Settings; active state highlighted
- `components/layout/RightPanel.tsx` — right sidebar shell (placeholder slots for metadata)
- `components/layout/DashboardLayout.tsx` — three-column grid layout that composes the above
- `app/(dashboard)/layout.tsx` — uses `DashboardLayout` as the route group layout
- All layout components are pure presentational; no data fetching

**Todo List:**
1. Create `src/components/layout/` directory
2. Build `Navbar.tsx`:
   - Fixed top bar, height 56px, `border-b border-border bg-background`
   - Left: logo mark + "TRACEFIX" wordmark in monospaced font
   - Right: icon buttons (Bell, Settings) + avatar circle
3. Build `Sidebar.tsx`:
   - Width 220px, fixed left, full height, `border-r border-border`
   - Nav items with Lucide icons: LayoutDashboard, GitBranch, Search, FileText, Settings
   - Active item: `bg-surface-2 text-white`, inactive: `text-muted hover:text-white`
   - Bottom: version badge
4. Build `RightPanel.tsx`:
   - Width 280px, fixed right, full height, `border-l border-border`
   - Accepts `children` prop — renders whatever metadata the page passes
5. Build `DashboardLayout.tsx`:
   - Three-column CSS Grid: `220px 1fr 280px`
   - Main content area scrollable; sidebars fixed
6. Create route group `app/(dashboard)/layout.tsx` wrapping with `DashboardLayout`
7. Create stub `app/(dashboard)/dashboard/page.tsx`
8. Create stub `app/(dashboard)/history/page.tsx` (Investigation History stub)
9. Create stub `app/(dashboard)/report/[id]/page.tsx` (Final Report stub)

**Relevant Context:**
- shadcn/ui `scroll-area` for the main content region overflow
- Lucide icons: LayoutDashboard, GitBranch, Search, FileText, Settings, Bell, User
- Color tokens defined in Sub-Task 1

**Status:** [x] done

---

## Sub-Task 3 — Reusable Primitive Components

**Intent:** Build all small, stateless, reusable UI primitives before composing pages so that
higher-level components can be assembled without duplication.

**Expected Outcomes:**
- `StatusBadge` — pill badge colored by status (running/completed/failed/verified/pending)
- `ProgressBar` — slim animated horizontal bar with percentage prop
- `MetricCard` — small labeled stat card (label + value + optional icon)
- `AnimatedTerminal` — fixed-height terminal window showing scrolling log lines
- `SectionHeader` — title + optional subtitle + optional right-slot (used in cards)
- All components are typed with TypeScript interfaces; no `any`

**Todo List:**
1. Create `src/components/ui/` extensions directory (separate from shadcn auto-generated)
   — use `src/components/primitives/` to avoid collision
2. Build `StatusBadge.tsx`:
   - Props: `status: "running" | "completed" | "failed" | "verified" | "pending"`
   - Color map: running→accent, completed→success, failed→error, verified→success, pending→muted
   - Animate `running` state with a pulsing dot (Framer Motion `animate` loop)
3. Build `ProgressBar.tsx`:
   - Props: `value: number` (0–100), `variant?: "default" | "success" | "error"`
   - Framer Motion `motion.div` width transition on value change
   - Slim (4px height), rounded full
4. Build `MetricCard.tsx`:
   - Props: `label: string`, `value: string | number`, `icon?: LucideIcon`, `trend?: "up" | "down"`
   - `bg-surface border border-border rounded-lg p-4`
5. Build `AnimatedTerminal.tsx`:
   - Props: `lines: string[]`, `isRunning?: boolean`
   - Fixed height container, monospace font, green text on dark bg (`#001a00` bg)
   - Auto-scroll to bottom when lines change (useEffect + ref)
   - Blinking cursor when `isRunning`
6. Build `SectionHeader.tsx`:
   - Props: `title: string`, `subtitle?: string`, `right?: ReactNode`

**Relevant Context:**
- Framer Motion `motion.div` + `animate` + `transition` for all animations
- Lucide `LucideIcon` type from `lucide-react`
- Do NOT use shadcn Badge directly — StatusBadge is purpose-built for investigation states

**Status:** [x] done

---

## Sub-Task 4 — Landing Page

**Intent:** Build the public-facing landing page at `/` that introduces TRACEFIX, communicates
the product value clearly, and drives the user to the dashboard.

**Expected Outcomes:**
- `app/page.tsx` renders the full landing page (no dashboard layout wrapper)
- Hero section with title, subtitle, description, CTA button
- Feature pipeline section with 5 animated step cards
- Page feels like a professional SaaS product (Linear/Vercel quality)
- Framer Motion entrance animations on scroll (viewport-triggered)
- CTA routes to `/dashboard`

**Todo List:**
1. Create `src/components/landing/HeroSection.tsx`:
   - Full-viewport-height section, centered content
   - "TRACEFIX" in large monospaced bold (tracked letters)
   - Subtitle: "Evidence-Driven Autonomous Debugging" in muted text
   - Description block: 4 lines as a vertical list with `→` separators
   - CTA: large `Button` (IBM Blue) "Start Investigation" linking to `/dashboard`
   - Subtle background: CSS radial gradient from `#0d1424` center, no hard blobs
2. Create `src/components/landing/FeaturePipeline.tsx`:
   - Horizontal (or vertical on narrow desktop) pipeline of 5 cards
   - Cards: Repository Investigation → Bug Reproduction → Root Cause Analysis →
     Regression Test Generation → Verified Fix
   - Cards connected with arrow/chevron dividers
   - Framer Motion stagger entrance animation (each card delays 0.1s)
   - Each card: icon + title + short one-line description
3. Create `src/components/landing/LandingNav.tsx`:
   - Minimal top bar: TRACEFIX logo left, "Sign In" and "Dashboard" links right
   - `backdrop-blur` on scroll (use `useScroll` from Framer Motion or scroll listener)
4. Assemble in `app/page.tsx`:
   - `LandingNav` + `HeroSection` + `FeaturePipeline`
   - `bg-background` full page

**Relevant Context:**
- This page does NOT use `DashboardLayout` — it has its own `LandingNav`
- Lucide icons for feature cards: Search, Bug, Lightbulb, FlaskConical, ShieldCheck
- Framer Motion: `motion.div` with `initial`, `whileInView`, `viewport={{ once: true }}`

**Status:** [x] done

---

## Sub-Task 5 — Repository Card & Bug Report Card

**Intent:** Build the two input cards that sit at the top of the Dashboard center column —
the Repository info card and the Bug Report textarea card with "Start Investigation" trigger.

**Expected Outcomes:**
- `RepositoryCard` displays repo metadata: name, language, branch, file count, test count, status
- `BugReportCard` contains a textarea and a "Start Investigation" button; calls the API on submit
- Both cards are wired to accept props and emit typed events; no hardcoded data
- `BugReportCard` has loading state (button spinner) while API call is in-flight
- Form validation: textarea must not be empty before submit

**Todo List:**
1. Create `src/components/dashboard/RepositoryCard.tsx`:
   - Props: `repo: RepositoryInfo` (define interface in `src/types/investigation.ts`)
   - Fields shown: repo name (monospace + GitHub icon), language badge, branch, files, tests, status
   - `StatusBadge` for the repo connection status
   - Compact card layout, `bg-surface border border-border rounded-xl p-5`
2. Create `src/types/investigation.ts`:
   - `RepositoryInfo`: `{ name, url, language, branch, fileCount, testCount, status }`
   - `BugReport`: `{ id, title, description, repoUrl, status, createdAt }`
   - `Agent`: `{ id, name, status, currentTask, progress, result? }`
   - `InvestigationStatus`: `{ investigationId, phase, agents, timeline, rootCause?, diff?, regressionTest?, verification? }`
   - `TimelineItem`: `{ id, label, status: "pending" | "running" | "completed" | "failed", timestamp? }`
   - `RootCause`: `{ file, line, issue, confidence, evidenceIds }`
   - `Evidence`: `{ id, type, title, content }`
   - `Verification`: `{ bugReproduced, rootCauseVerified, regressionGenerated, existingTestsPassed, newTestsPassed, impactAnalyzed, overallStatus }`
3. Create `src/components/dashboard/BugReportCard.tsx`:
   - Props: `onSubmit: (description: string) => Promise<void>`, `isLoading: boolean`
   - shadcn `Textarea` with placeholder "Describe the bug..."
   - Character count display (bottom-right of textarea)
   - Submit `Button` with Lucide `Play` icon; shows `Loader2` spinner when `isLoading`
   - Error state: red border + error message below textarea
4. Create `src/hooks/useInvestigation.ts`:
   - Encapsulates: starting an investigation (POST `/api/investigate`), polling status
     (GET `/api/investigate/status?id=X` every 3s), and storing state
   - Returns: `{ status, start, isPolling, error }`
   - Uses `useCallback` and `useEffect` cleanup to cancel polling on unmount

**Relevant Context:**
- All types live in `src/types/investigation.ts` — referenced by every feature sub-task after this
- The hook `useInvestigation` is the single source of truth for dashboard state

**Status:** [x] done

---

## Sub-Task 6 — Agent Cards & Investigation Timeline

**Intent:** Build the animated center-column investigation UI — the step-by-step timeline and
the grid of independently-animated agent cards — that appears after investigation starts.

**Expected Outcomes:**
- `Timeline` + `TimelineItem` components render the investigation phase list with animated state
- `AgentCard` renders a single agent's status, current task, and progress bar
- `AgentGrid` renders all agents in a responsive 2-column grid
- Components accept live `InvestigationStatus` data from the polling hook
- Each `TimelineItem` animates in sequentially using Framer Motion stagger
- Running agents show pulsing status; completed show checkmark; failed show red

**Todo List:**
1. Create `src/components/investigation/TimelineItem.tsx`:
   - Props: `item: TimelineItem`, `index: number`
   - Left: vertical line connector; circle icon (check for completed, spinner for running, dot for pending)
   - Framer Motion: `initial={{ opacity: 0, x: -12 }}` → `animate={{ opacity: 1, x: 0 }}`
   - Delay: `index * 0.08s`
   - Color: completed→success, running→accent, pending→border
2. Create `src/components/investigation/Timeline.tsx`:
   - Props: `items: TimelineItem[]`
   - Wraps `TimelineItem` list in a `motion.div` with `staggerChildren`
   - Vertical layout with connecting line behind the circles
3. Create `src/components/investigation/AgentCard.tsx`:
   - Props: `agent: Agent`
   - Card layout: agent name (bold), `StatusBadge`, current task (muted small text), `ProgressBar`
   - Running state: card has subtle left `border-l-2 border-accent` accent
   - Completed state: `border-l-2 border-success`
   - Framer Motion `layout` prop for smooth reflow when status changes
4. Create `src/components/investigation/AgentGrid.tsx`:
   - Props: `agents: Agent[]`
   - 2-column CSS grid, gap-4
   - Renders `AgentCard` per agent; new agents animate in with `AnimatePresence`
5. Create `src/components/investigation/InvestigationCenter.tsx`:
   - Composes `Timeline` + `AgentGrid` + section headers
   - Top: "Investigation Timeline" section
   - Below: "Active Agents" section
   - Accepts full `InvestigationStatus` as prop

**Relevant Context:**
- Types from `src/types/investigation.ts` (Sub-Task 5)
- `StatusBadge` and `ProgressBar` from Sub-Task 3
- `AnimatePresence` from `framer-motion` for enter/exit of new agent cards
- The connecting vertical line in Timeline: absolutely positioned `div` behind the circles

**Status:** [x] done

---

## Sub-Task 7 — Root Cause Card & Evidence Drawer

**Intent:** Build the Root Cause highlighted card and the slide-in Evidence Drawer that shows
detailed evidence items when the user clicks "View Evidence".

**Expected Outcomes:**
- `RootCauseCard` renders the root cause finding with file, line, issue, confidence
- "View Evidence" button opens the Evidence Drawer
- `EvidenceDrawer` slides in from the right as an overlay (does not push content)
- `EvidenceItem` renders each piece of evidence; clicking one expands a detail panel
- Drawer can be closed with X button or ESC key
- All components accept typed props; no hardcoded content

**Todo List:**
1. Create `src/components/investigation/RootCauseCard.tsx`:
   - Props: `rootCause: RootCause`, `onViewEvidence: () => void`
   - Highlighted card: `border border-accent/30 bg-surface-2 rounded-xl p-6`
   - Header: "ROOT CAUSE" label in uppercase accent color
   - Grid: File / Line / Issue / Confidence as 2×2 labeled values
   - Confidence shown as `ProgressBar` + percentage text
   - "View Evidence" `Button` (outlined, accent) at the bottom
   - Framer Motion entrance: `initial={{ opacity: 0, y: 16 }}` → `animate`
2. Create `src/components/investigation/EvidenceItem.tsx`:
   - Props: `evidence: Evidence`, `isExpanded: boolean`, `onToggle: () => void`
   - Collapsed: icon + title + chevron
   - Expanded: full `content` block rendered in monospace pre block
   - Framer Motion `AnimatePresence` + `motion.div` for expand/collapse
   - Evidence type icon map: StackTrace→AlertCircle, GitCommit→GitCommit,
     RelatedFile→File, MissingTest→FlaskConical, ExecutionTrace→Activity
3. Create `src/components/investigation/EvidenceDrawer.tsx`:
   - Props: `isOpen: boolean`, `onClose: () => void`, `evidenceItems: Evidence[]`
   - Uses shadcn `Drawer` or custom `motion.div` positioned fixed right-0
   - Width: 420px, full height, `bg-surface border-l border-border`
   - Framer Motion: `initial={{ x: 420 }}` → `animate={{ x: 0 }}` slide from right
   - `AnimatePresence` to mount/unmount cleanly
   - Header: "Evidence" title + close (X) button
   - Body: scrollable list of `EvidenceItem` components
   - Backdrop: semi-transparent overlay `div` covering the rest of the screen
   - ESC key closes (useEffect + keydown listener)
4. Wire `RootCauseCard` ↔ `EvidenceDrawer` in `InvestigationCenter.tsx`:
   - Local `useState` for `drawerOpen` and `expandedEvidenceId`

**Relevant Context:**
- Types: `RootCause`, `Evidence` from `src/types/investigation.ts`
- Do NOT use shadcn Sheet — build a custom `motion.div` drawer for full animation control
- Z-index: drawer at `z-50`, backdrop at `z-40`

**Status:** [x] done

---

## Sub-Task 8 — Code Diff Viewer & Regression Test Card

**Intent:** Build the Monaco-based unified diff viewer and the Regression Test summary card
that appear after root cause is established.

**Expected Outcomes:**
- `CodeDiffViewer` renders a unified diff string in Monaco Editor with syntax highlighting,
  inline +/- decorations, and line numbers
- `RegressionTestCard` shows the generated test name, status badge, and "Open Test" button
- Both components handle loading/empty states gracefully
- Monaco is loaded lazily (dynamic import with `ssr: false`) to avoid SSR issues

**Todo List:**
1. Create `src/components/investigation/CodeDiffViewer.tsx`:
   - Props: `diff: string`, `language?: string`, `isLoading?: boolean`
   - Lazy-load Monaco with `next/dynamic` + `ssr: false`
   - Use `@monaco-editor/react` `Editor` component (not DiffEditor — unified view)
   - Configure Monaco: `theme: "vs-dark"`, `readOnly: true`, `minimap: { enabled: false }`,
     `lineNumbers: "on"`, `scrollBeyondLastLine: false`, `fontSize: 13`
   - After mounting, apply delta decorations for lines starting with `+` (green background)
     and `-` (red background) using Monaco's `editor.deltaDecorations` API
   - Loading state: skeleton placeholder same height as editor
   - Header: file path label + "Patch" badge
2. Create `src/components/investigation/RegressionTestCard.tsx`:
   - Props: `testName: string`, `status: "pass" | "fail" | "pending"`, `onOpen: () => void`
   - Card showing: generated test name in monospace, `StatusBadge`, "Open Test" button
   - "Open Test" expands an inline Monaco code block (same lazy approach) showing test source
3. Add both to `InvestigationCenter.tsx` below the agent grid and root cause sections

**Relevant Context:**
- `@monaco-editor/react` — already installed in Sub-Task 1
- `next/dynamic` is the correct pattern for Monaco in Next.js (avoids `window` SSR errors)
- The `diff` prop is a raw unified diff string (e.g., output of `git diff`)
- Delta decorations require the `useRef` of the Monaco editor instance via `onMount` callback

**Status:** [x] done

---

## Sub-Task 9 — Verification Report & Right Sidebar Metadata

**Intent:** Build the Verification Report card that summarizes the end-to-end investigation
result, and populate the Right Sidebar with live metadata from the investigation state.

**Expected Outcomes:**
- `VerificationReport` card shows all 6 checklist items + overall VERIFIED/FAILED status
- Right sidebar shows: repository info, affected files list, related commits, confidence %, risk level, execution time, estimated time saved
- Right sidebar updates reactively as investigation progresses
- "VERIFIED" state: green overall status banner; "FAILED": red

**Todo List:**
1. Create `src/components/investigation/VerificationReport.tsx`:
   - Props: `verification: Verification`
   - 6-row checklist: each row has icon (Check or X), label, and boolean status
   - Rows: Bug Reproduced, Root Cause Verified, Regression Test Generated,
     Existing Tests Passed, New Tests Passed, Impact Analysis Completed
   - Bottom: large status banner "OVERALL: VERIFIED" or "OVERALL: FAILED"
   - Framer Motion: rows stagger in with 0.06s delay each
2. Create `src/components/dashboard/RightSidebarContent.tsx`:
   - Props: `status: InvestigationStatus | null`
   - Sections (with `SectionHeader` + `Separator`):
     1. Repository — name, language, branch
     2. Affected Files — list of file paths (monospace small text)
     3. Related Commits — short hash + message list
     4. Analysis — Confidence (`ProgressBar`), Risk Level (`StatusBadge`), Execution Time
     5. Estimated Time Saved — large number display (e.g., "4.2 hrs")
   - When `status` is null: show skeleton/placeholder rows
3. Pass `RightSidebarContent` into `RightPanel` via the dashboard page's layout

**Relevant Context:**
- `VerificationReport` sits at the bottom of `InvestigationCenter.tsx`
- `Verification` type from `src/types/investigation.ts`
- Risk level values: "low" | "medium" | "high" — map to success/warning/error in StatusBadge

**Status:** [x] done

---

## Sub-Task 10 — Dashboard Page Assembly & API Route Stubs

**Intent:** Wire all components together in `app/(dashboard)/dashboard/page.tsx`,
implement the `useInvestigation` polling hook fully, and create API route stubs that
return realistic fixture data so the UI can be developed and demoed without a real backend.

**Expected Outcomes:**
- Dashboard page renders the full investigation flow end-to-end using the hook
- Pre-investigation state: shows `RepositoryCard` + `BugReportCard`
- Post-start state: shows `InvestigationCenter` (timeline + agents + root cause + diff + report)
- Smooth transition between states using `AnimatePresence`
- API stubs at `/api/investigate` (POST) and `/api/investigate/status` (GET) return fixture data
- Right sidebar is populated with live (polled) data

**Todo List:**
1. Create `app/api/investigate/route.ts` (POST):
   - Accepts `{ repoUrl, bugDescription }`, returns `{ investigationId: "demo-001" }`
2. Create `app/api/investigate/status/route.ts` (GET):
   - Accepts `?id=X`, returns a full `InvestigationStatus` fixture object
   - Fixture includes: 10-item timeline (mix of completed/running/pending),
     3 agents, rootCause, diff string, regressionTest, verification, metadata
3. Finalize `src/hooks/useInvestigation.ts`:
   - POST on `start()` → store `investigationId`
   - Poll GET every 3s while `investigationId` is set and status is not terminal
   - Terminal phases: "completed" | "failed"
   - Cleanup: `clearInterval` on unmount
4. Assemble `app/(dashboard)/dashboard/page.tsx`:
   - Use `useInvestigation` hook
   - `AnimatePresence` toggling between pre-investigation and post-investigation views
   - Pass `status` down to `InvestigationCenter` and `RightSidebarContent`
   - Pass `onSubmit` and `isLoading` to `BugReportCard`
5. Create stub pages:
   - `app/(dashboard)/history/page.tsx`: "Investigation History" heading + "Coming soon" muted text
   - `app/(dashboard)/report/[id]/page.tsx`: "Investigation Report" heading + "Coming soon" muted text

**Relevant Context:**
- `AnimatePresence` requires keys on children to detect mounting/unmounting
- Poll interval: 3000ms; clear with `useEffect` cleanup
- The fixture data in the API stub is the only place mock data lives

**Status:** [x] done

---

## Sub-Task 11 — Polish, Accessibility & Final Review

**Intent:** Review all components for visual consistency, animation smoothness, empty/loading/
error states, and basic keyboard accessibility. Fix any layout issues, ensure the landing page
and dashboard are pixel-consistent with the design principles.

**Expected Outcomes:**
- All interactive elements have `focus-visible` ring styles
- No layout overflow or clipping on 1440px viewport
- All loading states use consistent skeleton shimmer pattern
- Framer Motion animations do not run if `prefers-reduced-motion` is set
- Color tokens are consistently used — no hardcoded hex values outside `tailwind.config.ts`
- Console is clean (no warnings, no missing key props)
- `npm run build` passes with no TypeScript errors

**Todo List:**
1. Audit all cards and components for consistent border-radius, padding, and spacing
2. Add `motion.div` with `prefers-reduced-motion` check using Framer Motion `useReducedMotion`
3. Ensure all `<button>` elements have accessible labels (aria-label where icon-only)
4. Add shimmer skeleton component `src/components/primitives/Skeleton.tsx` and apply to
   all loading states that currently use raw divs
5. Run `npx tsc --noEmit` and fix any TypeScript errors
6. Run `npm run build` and resolve any build errors
7. Final visual check: landing page hero, feature pipeline, dashboard pre/post states,
   evidence drawer, code diff viewer, verification report

**Relevant Context:**
- Framer Motion: `const shouldReduceMotion = useReducedMotion()` then conditionally set variants
- shadcn/ui components already have accessible primitives — do not override their ARIA

**Status:** [ ] pending
