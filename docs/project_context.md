# Vidxa - Video Knowledge Search Platform

## Project Overview
Vidxa is a web application that allows users to upload videos, automatically transcribes them using Whisper, and provides a search interface to find exact moments in the videos and jump directly to those timestamps.

## Architecture & Tech Stack
- **Frontend:** React + Vite + TypeScript, using standard CSS (Glassmorphism design).
- **Backend:** Node.js + Express + TypeScript.
- **Database:** PostgreSQL (with Prisma ORM).
- **Authentication:** JWT stored in secure `httpOnly` cookies.
- **Background Processing (Planned):** Redis + BullMQ for handling video extraction.
- **Video Processing (Planned):** FFmpeg for metadata and audio extraction.
- **Transcription (Planned):** Local Whisper model.

## Current State (End of Phase 3)
We are building the project phase by phase.

- **Phase 0:** Project scaffolding and infrastructure (Docker compose for DB).
- **Phase 1:** Basic application setup. Express server, React frontend, PostgreSQL connection.
- **Phase 2:** Authentication system. Register, Login, Logout, and Protected Routes functionality. Replaced raw `pg` driver with `Prisma` for database operations.
- **Phase 3:** Video Upload & Library. Configured `multer` for local file storage, created Prisma models, built the HTTP 206 Partial Content video streaming endpoint, and wired up the Dashboard grid & Video Player UI.

## Upcoming Phases
- **Phase 4:** FFmpeg Processing (Extract duration, dimensions, thumbnails, audio).
- **Phase 5:** Background Processing (Move FFmpeg tasks to BullMQ workers).
- **Phase 6:** Whisper Transcription (Generate timestamped transcriptions).
- **Phase 7:** Transcript UI (Interactive transcript on the video player).
- **Phase 8:** Full-Text Search inside a video.
- **Phase 9:** Full-Text Search across all videos.
- **Phase 10 & 11:** Improved search with vector embeddings (pgvector).
- **Phase 12:** MVP Polish.

## Environment Variables Needed
### Backend (`server/.env`)
```
PORT=4000
DATABASE_URL=postgres://postgres:password@localhost:5432/vidxa
JWT_SECRET=super_secret_key_change_in_production
NODE_ENV=development
```

## Troubleshooting & Fixes
- **TypeScript `verbatimModuleSyntax` Error**: Fixed an issue where TypeScript reported `ECMAScript imports and exports cannot be written in a CommonJS file`. Resolved by changing `module` to `commonjs`, disabling `verbatimModuleSyntax`, and enabling `esModuleInterop` in `server/tsconfig.json`.
- **Prisma `parseInt(id)` Type Error**: Fixed type complaints for `req.params.id` in `videoController.ts` by explicitly casting it to string (`id as string`).
