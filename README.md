# MeetingMind

AI-powered meeting intelligence and collaborative task board. Paste a meeting transcript, and MeetingMind extracts a summary, decisions and action items, drops the action items onto a real-time Kanban board, and lets you ask questions across all past meetings with cited answers.

> **Status:** under active development. Phase 1 (project scaffolding) is complete.

## Why

Teams agree on decisions in meetings, then the action items get lost in notes nobody reads. MeetingMind closes the gap between *what was said* and *what gets done*:

1. **Lost action items:** nobody wants to type tasks into Jira/Trello by hand.
2. **Lost context:** two weeks later nobody remembers *why* a decision was made.
3. **Information silos:** new teammates can't easily search past meetings.

## How it works

```text
Transcript -> BullMQ job -> LLM extraction -> Member resolution -> Kanban board (live)
                                  |
                                  +-> chunk + embed -> pgvector -> "Ask Your Meetings" (RAG)
```

1. A user pastes a transcript.
2. A background worker (BullMQ + Redis) asks an LLM for a summary, decisions and action items, validated with Zod.
3. Names like "Rahul" are matched to real workspace members and Task records are created.
4. Tasks appear on a drag-and-drop Kanban board that syncs live over Socket.io.
5. Transcripts are chunked and embedded into PostgreSQL (pgvector) so users can ask questions and get answers that cite the source meetings.
6. A one-click weekly digest summarises progress and bottlenecks.

Workspaces are multi-tenant with `OWNER`, `ADMIN` and `MEMBER` roles; data and vector search are isolated per workspace.

## Tech stack

| Layer | Tech |
| :--- | :--- |
| Monorepo | pnpm workspaces |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Client state | TanStack Query v5, Zustand |
| Drag and drop | `@dnd-kit/core`, `@dnd-kit/sortable` |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM, pgvector |
| Queue | Redis, BullMQ |
| Real-time | Socket.io |
| AI | Claude / OpenAI + embeddings, Zod-validated structured output |

## Project structure

```text
MeetMind/
├── apps/
│   ├── api/              # Express backend (REST + Socket.io + BullMQ workers)
│   └── web/              # React frontend (Vite)
├── packages/
│   └── shared/           # Zod schemas and types used by both apps
├── docker-compose.yml    # Local Postgres (with pgvector) and Redis
├── tsconfig.base.json    # Strict TypeScript settings shared by all packages
├── pnpm-workspace.yaml   # Declares the workspace packages
└── .env.example          # Required environment variables
```

## Getting started

**Prerequisites:** Node.js 20+, pnpm 10+, Docker.

```bash
# 1. Install dependencies for every package
pnpm install

# 2. Create your local env file
cp .env.example .env

# 3. Start Postgres and Redis
pnpm db:up

# 4. Typecheck all packages
pnpm typecheck
```

### Useful scripts

| Command | What it does |
| :--- | :--- |
| `pnpm dev` | Runs every app in `apps/` in dev mode (once they have a `dev` script) |
| `pnpm build` | Builds all packages |
| `pnpm typecheck` | Type-checks all packages |
| `pnpm db:up` / `pnpm db:down` | Start / stop the Postgres and Redis containers |

## Roadmap

- [x] **Phase 1:** monorepo scaffolding, TypeScript config, Docker Compose
- [ ] **Phase 2:** Prisma schema (User, Workspace, Membership, Meeting, Task, MeetingChunk)
- [ ] **Phase 3:** authentication and workspaces with role checks
- [ ] **Phase 4:** meeting ingestion API, BullMQ worker, LLM extraction
- [ ] **Phase 5:** assignee resolution and task creation
- [ ] **Phase 6:** frontend shell (auth, workspace layout, meetings)
- [ ] **Phase 7:** real-time Kanban board
- [ ] **Phase 8:** RAG: chunking, embeddings, cited answers
- [ ] **Phase 9:** analytics dashboard and weekly digest

This README is updated at the end of each phase.
