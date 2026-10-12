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

## Current State (End of Phase 5)
We are building the project phase by phase.

- **Phase 0:** Project scaffolding and infrastructure (Docker compose for DB).
- **Phase 1:** Basic application setup. Express server, React frontend, PostgreSQL connection.
- **Phase 2:** Authentication system. Register, Login, Logout, and Protected Routes functionality. Replaced raw `pg` driver with `Prisma` for database operations.
- **Phase 3:** Video Upload & Library. Configured `multer` for local file storage, created Prisma models, built the HTTP 206 Partial Content video streaming endpoint, and wired up the Dashboard grid & Video Player UI.
- **Phase 4:** FFmpeg Processing. Added `fluent-ffmpeg` to synchronously extract video duration, capture 1s thumbnails, and extract audio tracks into `.mp3` format immediately after upload. Exposed static routes to serve thumbnails on the frontend Dashboard grid.
- **Phase 5:** Background Processing (Redis + BullMQ). Added Redis 7 container to Docker Compose. Configured BullMQ `video-processing` queue with automatic exponential backoff retries (3 attempts). Offloaded heavy FFmpeg tasks from Express controllers to a dedicated BullMQ worker with controlled concurrency (2 simultaneous jobs). Controller immediately returns HTTP 201 on upload.

## Upcoming Phases
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
DATABASE_URL=postgres://postgres:password@localhost:5433/vidxa
JWT_SECRET=super_secret_key_change_in_production
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Troubleshooting & Fixes
- **TypeScript `verbatimModuleSyntax` Error**: Fixed an issue where TypeScript reported `ECMAScript imports and exports cannot be written in a CommonJS file`. Resolved by changing `module` to `commonjs`, disabling `verbatimModuleSyntax`, and enabling `esModuleInterop` in `server/tsconfig.json`.
- **Prisma `parseInt(id)` Type Error**: Fixed type complaints for `req.params.id` in `videoController.ts` by explicitly casting it to string (`id as string`).
- **BigInt JSON Serialization Error**: Fixed `TypeError: Do not know how to serialize a BigInt` which occurred when returning Prisma models containing `BigInt` (like the video `size` field) via `res.json()`. Resolved by creating a `serializeVideo` helper to manually convert `BigInt` values to strings before sending them in the response.
- **Fluent-FFmpeg Hanging Promise**: In `extractAudio()`, fluent-ffmpeg output pipeline commands require calling `.run()` to trigger execution. Without `.run()`, the promise never resolved or rejected, leaving the background task hanging and videos indefinitely stuck in `PROCESSING`. Fixed by adding `.run()` to the pipeline.
- **Silent Videos Handling (No Audio Track)**: Videos without an audio stream caused FFmpeg audio conversion to error out. Fixed by adding `hasAudio: boolean` detection in `extractVideoMetadata` and conditionally extracting audio only when an audio track exists.
- **Reprocess Route**: Added `POST /api/videos/:id/reprocess` allowing manual triggering of video processing.

