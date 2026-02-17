# OpenCode Server API Reference

This document outlines the API surface of the OpenCode server (v0.1.x), based on source code analysis of `anomalyco/opencode`.

## Authentication

The server uses **HTTP Basic Auth**.
- **Username**: `opencode` (default, configurable via `OPENCODE_SERVER_USERNAME`)
- **Password**: Configured via `OPENCODE_OP_PASSWORD` or `OPENCODE_SERVER_PASSWORD`.

All requests must include the `Authorization` header: `Basic <base64(username:password)>`.

## Base URL

When running locally via `opencode serve`, the default base URL is `http://localhost:4096`.

## REST Endpoints

### Global

#### `GET /global/health`
Check server health.
- **Response**: `200 OK`
  ```json
  { "healthy": true, "version": "0.1.0" }
  ```

### Projects

#### `GET /project`
List all projects opened with OpenCode.
- **Response**: `200 OK` -> `Project[]`

#### `GET /project/current`
Get the currently active project.
- **Response**: `200 OK` -> `Project`

### Sessions

#### `GET /session`
List all sessions.
- **Query Params**:
  - `limit` (number): Max sessions to return.
  - `directory` (string): Filter by project directory.
- **Response**: `200 OK` -> `Session[]`

#### `GET /session/:id`
Get a specific session by ID.
- **Response**: `200 OK` -> `Session`

#### `POST /session`
Create a new session.
- **Body**: `{ "title": "My Session", ... }` (optional)
- **Response**: `200 OK` -> `Session`

#### `DELETE /session/:id`
Delete a session.
- **Response**: `200 OK` -> `true`

#### `GET /session/:id/message`
Get messages for a session.
- **Response**: `200 OK` -> `Message[]`

#### `POST /session/:id/message`
Send a message and stream the response (synchronous).
- **Body**: `{ "prompt": "Hello", "model": ... }`
- **Response**: Stream of `Message` objects (NDJSON-like).

#### `POST /session/:id/prompt_async`
Send a message asynchronously (fire and forget). Use SSE to listen for updates.
- **Body**: `{ "prompt": "Hello", "model": ... }`
- **Response**: `204 No Content`

## Server-Sent Events (SSE)

### Stream Endpoint
`GET /global/event`

Connect to this endpoint to receive real-time updates for all sessions and global events.

### Event Structure
Events are JSON objects with the following shape:
```ts
{
  "type": "event.type",
  "properties": { ... }
}
```

### Key Events

#### `message.part.delta`
Streamed token updates for a message part.
```json
{
  "type": "message.part.delta",
  "properties": {
    "sessionID": "...",
    "messageID": "...",
    "partID": "...",
    "delta": "token"
  }
}
```

#### `message.part.updated`
Full update for a message part (e.g. tool execution status change).
```json
{
  "type": "message.part.updated",
  "properties": {
    "part": { ...Part... }
  }
}
```

#### `session.status`
Session status updates (e.g. "running", "idle").
```json
{
  "type": "session.status",
  "properties": {
    "sessionID": "...",
    "status": { "status": "running" }
  }
}
```

#### `server.connected`
Initial event upon connection.

## Data Models (TypeScript Interfaces)

See `app/api/types.ts` for the complete TypeScript definitions derived from the server's Zod schemas.
