## 0. What is MeetingMind? (Product Definition & Purpose)

### The Executive Summary
**MeetingMind** is an **AI-powered meeting intelligence and collaborative project management SaaS platform**. 

It is designed to solve a universal workplace problem: **teams spend hours in meetings agreeing on decisions and action items, but those items get lost in unstructured notes or unread meeting recordings, rarely translating into executed tasks.**

Instead of acting as a generic chatbot, MeetingMind bridges the gap between **meeting conversations** and **task execution**.

### The Core Problem It Solves
1. **Lost Action Items**: Discussions happen, but nobody logs tasks into Jira/Trello because manual entry is tedious and slow.
2. **Disconnected Context**: When someone starts working on a task two weeks later, they forget *why* decisions were made.
3. **Information Silos**: New or absent team members have no quick way to search through past meetings to find specific agreements or rationale.

### The End-to-End Workflow

```text
┌─────────────────────────┐
│ 1. Meeting Transcript   │  User pastes or uploads a meeting transcript
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 2. Async AI Extraction  │  BullMQ queue + LLM extracts:
│    (Background Worker)  │  • Concise Executive Summary
│                         │  • Decisions List
│                         │  • Action Items (title, assignee, priority, due date)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 3. Member Resolution    │  Backend maps names (e.g. "Rahul") to registered workspace members;
│                         │  creates Task records linked back to the source meeting
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 4. Interactive Kanban   │  Tasks automatically appear on a collaborative board;
│    (Real-Time Sync)     │  Team drags & updates tasks via dnd-kit with live WebSockets
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 5. Semantic Search/RAG  │  Transcripts are chunked and vectorized (PostgreSQL + pgvector);
│    "Ask Your Meetings"  │  Users ask questions ("What did we decide about pricing?")
│                         │  and get answers with direct citations to specific meetings
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 6. Weekly AI Digest     │  One-click executive briefing of completed work,
│                         │  overdue bottlenecks, and recommended focus areas
└─────────────────────────┘
```

### Core Features at a Glance
1. **Meeting Ingestion & AI Intelligence**:
   - Paste raw meeting transcript.
   - Async background processing extracts a 3–4 sentence executive summary, concrete decisions made, and structured action items.
2. **Automated Assignee Resolution**:
   - Compares extracted attendee names with real workspace members and maps them to concrete user IDs.
3. **Collaborative Real-Time Kanban Board**:
   - Visual execution across `TODO`, `IN_PROGRESS`, and `DONE` using `@dnd-kit`.
   - Optimistic updates (immediate UI response with rollback safety on error).
   - Real-time multi-client synchronization via `Socket.io`.
4. **RAG-Powered Knowledge Base ("Ask Your Meetings")**:
   - Chunks and stores vector embeddings in PostgreSQL using the `pgvector` extension.
   - Natural language Q&A: answers grounded solely in meeting context with clickable source meeting citations.
5. **Multi-Tenant Workspaces & Role-Based Access**:
   - Isolated workspaces with `OWNER`, `ADMIN`, and `MEMBER` roles.
   - Strict data and vector search boundary isolation per workspace.
6. **Analytics Dashboard & Weekly Executive Digest**:
   - High-level KPIs (total, WIP, completed, overdue).
   - One-click weekly digest summarizing the week's progress and upcoming priorities for team managers.

### 30-Second Interview Elevator Pitch
> *"I built **MeetingMind**, an AI-powered meeting-to-action-board web application. It takes raw meeting transcripts, uses a background job queue with Redis and BullMQ to extract structured action items and decisions via LLMs, and maps those items directly onto a real-time collaborative Kanban board using WebSockets. It also indexes meeting chunks into PostgreSQL using Prisma ORM and pgvector so team members can use RAG to ask natural language questions across their entire meeting history with cited sources."*

## 1. Architectural Blueprint & Tech Stack Rationale

### Tech Stack Overview

| Layer | Chosen Tech | Resume & Practical Justification |
| :--- | :--- | :--- |
| **Monorepo** | pnpm workspaces | Industry-standard monorepo setup sharing TypeScript types & Zod schemas. |
| **Frontend** | React 18 + Vite + TypeScript | Blazing fast DX, strong typed components. |
| **Styling** | Tailwind CSS | Clean, modern SaaS aesthetic with minimal CSS bloat. |
| **State** | TanStack Query v5 + Zustand | Clear split: TanStack Query for server cache, Zustand for lightweight client state. |
| **Kanban DnD** | `@dnd-kit/core` & `@dnd-kit/sortable` | Modern, accessible drag-and-drop with smooth animations and optimistic updates. |
| **Backend** | Node.js + Express + TypeScript | Idiomatic, transparent REST + WebSocket backend. |
| **Database & ORM** | **PostgreSQL + Prisma ORM + pgvector** | Strong relational integrity, type-safe queries, and native vector similarity search without extra vector DBs. |
| **Queue / Cache** | **Redis + BullMQ** | **Crucial for resume!** Long-running AI analysis (10–30s) shouldn't block HTTP requests. |
| **Real-time** | Socket.io | Instant multi-user sync on Kanban board & async job completion alerts. |
| **AI & RAG** | Claude / OpenAI + Embeddings | Structured JSON output validated by Zod + RAG over meeting chunks using pgvector. |

## Note: Never generate all code at once build in steps and also give comments so that i can understand the code base better

## This is an overall plan it can be readjusted as we move, whatever i have understood as a fresher engineer for project i wrote here 

# The below is an approx plan of all phases and first three phases so far are mentioned in detail also as we move forward keep updating this CLAUDE.md file regularly so that things are aligned, if any thing feels left out or needs to be added do on the go accordingly

Each phase is designed to be completed iteratively with the AI coding assistant.

```
[Phase 1: Scaffolding & Shared Types]
         ↓
[Phase 2: Express Server + PostgreSQL + Prisma + Redis]
         ↓
[Phase 3: Prisma Schema, Relations & pgvector Migration]
         ↓
[Phase 4: JWT Authentication & Frontend Auth Shell]
         ↓
[Phase 5: Workspace System & Multi-Tenancy Security]
         ↓
[Phase 6: Meeting Management & Transcript Storage]
         ↓
[Phase 7: Task CRUD & Interactive Kanban with dnd-kit]
         ↓
[Phase 8: AI Structured Output Pipeline with BullMQ]
         ↓
[Phase 9: Real-Time Multi-User Collaboration (Socket.io)]
         ↓
[Phase 10: Vector Embeddings & RAG "Ask Your Meetings" (pgvector)]
         ↓
[Phase 11: Analytics Dashboard & Weekly AI Digest]
         ↓
[Phase 12: Security Hardening & Rate Limiting]
         ↓
[Phase 13: End-to-End Integration Testing]
         ↓
[Phase 14: Deployment & Portfolio README]
```

---

### PHASE 1: Scaffolding & Shared Contract
- **Goal**: Monorepo root setup and `@meetingmind/shared` package for end-to-end type safety.
- **Tasks**:
  1. Configure `pnpm-workspace.yaml`.
  2. Create `@meetingmind/shared` containing:
     - Enums: `TaskStatus` (`TODO`, `IN_PROGRESS`, `DONE`), `TaskPriority` (`LOW`, `MEDIUM`, `HIGH`), `WorkspaceRole` (`OWNER`, `ADMIN`, `MEMBER`), `ProcessingStatus` (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`).
     - Zod schemas for auth, tasks, meetings, workspaces.
     - Export derived TypeScript types (`z.infer<typeof schema>`).
- **Prompt to AI**: *"Generate the `packages/shared` package with pnpm workspace config, including Zod schemas and TypeScript type exports for Task, Meeting, User, and Workspace."*

---

### PHASE 2: Backend Core (Express + PostgreSQL + Prisma + Redis)
- **Goal**: Initialize Node.js server with PostgreSQL (via Prisma Client) and Redis connectivity.
- **Tasks**:
  1. Setup Express app with TypeScript (`tsx watch`).
  2. Implement `config/env.ts` with strict environment variable validation (`DATABASE_URL`, `REDIS_URL`, etc.).
  3. Initialize Prisma CLI (`pnpm prisma init`), generate client, and create singleton instance (`config/prisma.ts`).
  4. Establish ioredis connection with `maxRetriesPerRequest: null` for BullMQ compatibility (`config/redis.ts`).
  5. Centralized `AppError` and `errorHandler` middleware.
- **Prompt to AI**: *"Scaffold `apps/server` with Express, TypeScript, Prisma Client, and ioredis, along with a unified JSON error handling middleware."*

---

### PHASE 3: Prisma Schema, Relations & Migrations
- **Goal**: Define relational database models with foreign keys, indexes, and pgvector extension support.
- **Models**:
  1. `User`: `id` (UUID), `name`, `email` (unique), `passwordHash`, `avatar`, timestamps.
  2. `Workspace`: `id` (UUID), `name`, `ownerId` (relates to User), timestamps.
  3. `WorkspaceMember`: join table with compound unique index `[workspaceId, userId]`, `role` enum (`OWNER`, `ADMIN`, `MEMBER`).
  4. `Meeting`: `id` (UUID), `workspaceId`, `title`, `transcript` (Text), `summary` (Text), `decisions` (String array), `createdById`, `processingStatus` enum. Full-text search index on `(title, summary, transcript)`.
  5. `Task`: `id` (UUID), `workspaceId`, `meetingId` (nullable), `title`, `description` (Text), `assigneeId` (nullable, relates to User), `status` enum, `priority` enum, `dueDate`. Indexes on `(workspaceId, status)` and `(assigneeId)`.
  6. `MeetingChunk`: `id` (UUID), `meetingId`, `workspaceId`, `content` (Text), `embedding` (`Unsupported("vector(1536)")`), `chunkIndex`.
- **Tasks**:
  - Enable `vector` extension in PostgreSQL migration (`CREATE EXTENSION IF NOT EXISTS vector;`).
  - Run initial migration: `pnpm prisma migrate dev --name init`.
- **Prompt to AI**: *"Write the complete `prisma/schema.prisma` file with PostgreSQL models, relations, enums, and pgvector support, along with initial migration steps."*
