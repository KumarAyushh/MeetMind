// @meetingmind/api — Express + Socket.io backend (built in a later phase).
// Planned folder layout inside src/:
//   routes/      HTTP endpoints (auth, workspaces, meetings, tasks, search)
//   services/    business logic (member resolution, RAG, digest)
//   workers/     BullMQ workers that run AI extraction in the background
//   lib/         clients for Prisma, Redis, the LLM, and Socket.io
//   middleware/  auth checks, workspace-role checks, error handling

export {};
