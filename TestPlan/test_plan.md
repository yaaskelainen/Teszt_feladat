# Event Management System - Master Test Plan (TDD Strategy)

## 1. Introduction
This document outlines the testing strategy for the Event Management System, adhering to **Test Driven Development (TDD)** principles. It defines **what** needs to be tested and **expected outcomes** for Unit, Integration, and End-to-End (E2E) levels, with a special focus on **edge cases and "stupid user" scenarios**.

**Testing Pyramid Strategy:**
1.  **Unit Tests (70%)**: Fast, isolated tests for Domain Logic & Services (Mocked dependencies).
2.  **Integration Tests (20%)**: Tests for Adapters, Database persistence, and external API contracts.
3.  **E2E Tests (10%)**: Critical user journeys across the full stack.

---

## 2. Unit Tests (Domain & Business Logic)

These tests must be written **before** implementation code. They target the Interfaces defined in the System Architecture.

### 2.1 Authentication Service (`IAuthService`)
**Target**: `AuthService` (implementing `IAuthService`)
**Dependencies**: Mocked `IUserRepository`, Mocked `JwtService`, Mocked `EmailService`

| Test Case ID | Description | Input / Condition | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **UT-AUTH-001** | **Validate User Success** | Valid email & correct password. | Return `User` object (excluding sensitive data). |
| **UT-AUTH-002** | **Validate User - Wrong Password** | Valid email, incorrect password. | Return `null` (Do NOT throw logic error here). |
| **UT-AUTH-003** | **Validate User - User Not Found** | Non-existent email. | Return `null`. |
| **UT-AUTH-004** | **Login - Generate Tokens** | Valid `User` object. | Return object with signed `accessToken` (JWT) and `refreshToken`. |
| **UT-AUTH-005** | **Login - Payload Structure** | Valid `User` object. | JWT payload must contain `sub` (userId) and `roles`. |
| **UT-AUTH-006** | **Refresh Token - Success** | Valid, non-expired refresh token. | Return new `accessToken`. |
| **UT-AUTH-007** | **Refesh Token - Tampered** | Signature mismatch on token. | Throw `UnauthorizedException`. |
| **UT-AUTH-008** | **Extremely Long Password** | Password with 10,000 chars. | Reject immediately (DoS protection) or truncate safely. |
| **UT-AUTH-009** | **Password Reset - Request** | Valid Email. | Generate Reset Token, Call `EmailService.send()`. |
| **UT-AUTH-010** | **Password Reset - Confirm** | Valid Token + New Password. | Update User Password Hash, Invalidate Token. |
| **UT-AUTH-011** | **MFA Setup (Bonus)** | User requests MFA enable. | Return TOTP Secret + QR Code URL. |
| **UT-AUTH-012** | **MFA Verify (Bonus)** | User provides valid TOTP code. | Enable `mfaEnabled` flag on User entity. |

### 2.1.1 Authentication Controller (`AuthController`)
**Target**: `AuthController`
**Dependencies**: Mocked `AuthService`

| Test Case ID | Description | Input / Condition | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **UT-CTRL-001** | **Login Success** | Valid `LoginDto`. | Call `authService.validateUser` & `login`. Return tokens. |
| **UT-CTRL-002** | **Login Failed** | Invalid credentials (`validateUser` returns null). | Throw `UnauthorizedException`. |
| **UT-CTRL-003** | **Refresh Token** | Valid Refresh Token in body. | Call `authService.refresh`. Return new access token. |

### 2.2 User Repository (`IUserRepository`)
**Target**: `PrismaGenericRepository` (or equivalent adapter logic)
**Dependencies**: Mocked `Internal Prisma Client` (if testing mapping) or In-Memory DB

| Test Case ID | Description | Input / Condition | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **UT-USER-001** | **Create User** | Valid `User` DTO. | Return created `User` with generated ID. |
| **UT-USER-002** | **Find By Email - Exists** | Existing email. | Return `User` object. |
| **UT-USER-003** | **Find By Email - Missing** | Non-existent email. | Return `null`. |
| **UT-USER-004** | **Create User - Duplicate** | User DTO with existing email. | Throw `ConflictException` / Unique constraint error. |

### 2.2.1 Admin Service (`IAdminService`)
**Target**: `AdminService`
**Dependencies**: Mocked `IUserRepository`, Mocked `AuthService` (for hashing)

| Test Case ID | Description | Input / Condition | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **UT-ADM-001** | **Create User** | Valid email and roles. | Call `usersRepository.create` with hashed password. |
| **UT-ADM-002** | **Create Duplicate** | Email already exists. | Throw `ConflictException`. |

### 2.2.2 Admin Controller (`AdminController`)
**Target**: `AdminController`
**Dependencies**: Mocked `AdminService`

| Test Case ID | Description | Input / Condition | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **UT-ADCTRL-001** | **Provision User** | Valid JSON `{email, roles}`. | Call `adminService.createUser`. Return 201. |

### 2.3 Event Service (`IEventService`)
**Target**: `EventService`
**Dependencies**: Mocked `IEventRepository`

| Test Case ID | Description | Input / Condition | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **UT-EVENT-001** | **Create Event - Success** | Valid title, date (future), ownerId. | Call `repo.save()` and return `Event` object. |
| **UT-EVENT-002** | **Create Event - Past Date** | Date in the past (e.g., 1999). | Throw `BadRequestException`. |
| **UT-EVENT-003** | **Get User Events** | Valid `userId`. | Call `repo.findManyByOwner(userId)` and return list. |
| **UT-EVENT-004** | **Update Description - Success** | Valid `eventId`, `userId` (owner), new text. | Call `repo.save()` with updated description. |
| **UT-EVENT-005** | **Update Desc - Not Owner** | `eventId` exists, but `userId` != `ownerId`. | Throw `ForbiddenException` ("Access Denied"). |
| **UT-EVENT-006** | **Update Desc - Event 404** | Non-existent `eventId`. | Throw `NotFoundException`. |
| **UT-EVENT-007** | **Create Event - Emoji Title** | Title: "🎉🎈🚀". | Accept (Unicode support is mandatory). |
| **UT-EVENT-008** | **Create Event - Max Title Length** | Title > 150 chars. | Throw `BadRequestException` ("Title too long"). |
| **UT-EVENT-009** | **Delete Event - Success** | Valid `eventId`, `userId` (owner). | Call `repo.delete(eventId)`. |
| **UT-EVENT-010** | **Delete Event - Not Owner** | `eventId` exists, `userId` != `ownerId`. | Throw `ForbiddenException`. |

### 2.3.1 Event Controller (`EventController`)
**Target**: `EventController`
**Dependencies**: Mocked `EventService`

| Test Case ID | Description | Input / Condition | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **UT-EVCTRL-001** | **Create Event** | Valid `CreateEventDto` + `userId`. | Call `eventService.createEvent`. Return 201. |
| **UT-EVCTRL-002** | **List Events** | Valid `userId`. | Call `eventService.getUserEvents`. Return array of events. |
| **UT-EVCTRL-003** | **Update Description** | `eventId`, `userId`, `newDesc`. | Call `eventService.updateDescription`. Return 200. |
| **UT-EVCTRL-004** | **Delete Event** | `eventId`, `userId`. | Call `eventService.deleteEvent`. Return 204. |

### 2.4 Event Repository (`IEventRepository`)
**Target**: `PrismaEventRepository`
**Dependencies**: Mocked `Internal Prisma Client`

| Test Case ID | Description | Input / Condition | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **UT-EREPO-001** | **Save - Create New** | Event with empty ID. | Call `prisma.event.create` and return entity with ID. |
| **UT-EREPO-002** | **Save - Update Existing** | Event with valid ID. | Call `prisma.event.update` and return updated entity. |
| **UT-EREPO-003** | **Find By ID** | Valid UUID string. | Return mapped `Event` domain object or `null`. |
| **UT-EREPO-004** | **Find By Owner** | Valid `ownerId`. | Return list of mapped `Event` objects. |

### 2.5 AI Adapter Service (`IAIService` - Strategy Pattern)
**Target**: `GeminiAdapter`
**Dependencies**: Mocked `External SDK` (e.g., GoogleGenerativeAI)

| Test Case ID | Description | Input / Condition | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **UT-AI-001** | **Generate Response** | Valid prompt text. | Return text response from mocked SDK message. |
| **UT-AI-002** | **Context Handler** | Prompt + Context Documents. | Verify SDK called with combined string: "Context: ... User: ...". |
| **UT-AI-003** | **API Failure** | External API throws 500 error. | Throw internal `ServiceUnavailableException` (Graceful handling). |
| **UT-AI-004** | **Empty Prompt** | User sends empty string/whitespace. | Return static error: "Please ask a question." (Don't call API). |

### 2.6 Help Desk Service (`IHelpDeskService`)
**Target**: `HelpDeskService`
**Dependencies**: Mocked `IChatMessageRepository`

| Test Case ID | Description | Input / Condition | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **UT-HELP-001** | **Send Message** | User ID, Message content. | Save `ChatMessage` with `senderId` and `senderRole='USER'`. |
| **UT-HELP-002** | **Get Queue** | No input (Agent context). | Return list of unique active chats (grouped by user). |
| **UT-HELP-003** | **Reply to Chat** | Agent ID, User ID, Content. | Save `ChatMessage` with `senderId=AgentID` and `senderRole='AGENT'`. |
| **UT-HELP-004** | **Get History** | User ID. | Return all messages exchanged with this user ordered by date. |
| **UT-HELP-005** | **AI Automated Reply** | User sends message. | Verify `IAIService.generateResponse` is called and AI reply is saved. |

### 2.6.1 Help Desk Controller (`HelpDeskController`)
**Target**: `HelpDeskController`
**Dependencies**: Mocked `HelpDeskService`

| Test Case ID | Description | Input / Condition | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **UT-HCTRL-001** | **Post Chat** | User context + message. | Call `service.sendMessage`. Return 200. |
| **UT-HCTRL-002** | **Get Queue** | Agent context. | Call `service.getQueue`. Return 200. |
| **UT-HCTRL-003** | **Post Reply** | Agent context + userTarget + message. | Call `service.replyToUser`. Return 200. |
| **UT-HCTRL-004** | **Get History** | User context. | Call `service.getHistory`. Return 200. |

---

### 2.7 Audit Service (`IAuditService`)
**Target**: `AuditService`
**Dependencies**: Mocked `IAuditRepository`

| Test Case ID | Description | Input / Condition | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **UT-AUDIT-001** | **Log Security Event** | Action, UserID, Metadata. | Verify entry saved in Audit store. |

---

## 3. Integration Tests (Adapters & Infrastructure)

These tests verify that our adapters correctly interact with **real** (or Dockerized) infrastructure components.

### 3.1 Persistence Integration (PostgreSQL)
**Environment**: Docker container with Test DB.
**Scope**: `PrismaUserRepository`, `PrismaEventRepository`

| Test Case ID | Description | Steps / Action | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **IT-DB-001** | **User Persistence Roundtrip** | 1. `repo.create(user)`<br>2. `repo.findById(user.id)` | Retrieved user matches created user exactly. |
| **IT-DB-002** | **Event Foreign Key Constraint** | 1. Create Event with non-existent `ownerId`. | Database throws Foreign Key violation error. |
| **IT-DB-003** | **Event Description - Weird Chars** | 1. Save Event with desc: `NULL`, `\0`, `\n`, `Robert'); DROP TABLE Students;--`. | Save successfully as literal string. **NO** SQL injection. |
| **IT-DB-004** | **Event Delete Cascade (Bonus)** | 1. Create User + Event.<br>2. Delete User. | Verify Event is also deleted (if ON DELETE CASCADE is set) OR User deletion fails (if strict). |

### 3.2 AI Service Integration
**Type**: Contract Test (Mocked Server or Sandbox API)
**Scope**: `GeminiAdapter`

| Test Case ID | Description | Steps / Action | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **IT-AI-001** | **Live/Sandbox Connection** | Call `generateResponse("Hello")` with valid API Key. | Receive non-empty string response. (Verifies API Key & Network). |

### 3.3 Auth Controller Integration (API Layer)
**Tool**: `Server` (Supertest)
**Scope**: `AuthController` + `AuthService` (Real)

| Test Case ID | Description | Steps / Action | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **IT-API-001** | **POST /auth/login** | Send valid JSON credentials. | HTTP 201 Created + JSON with `accessToken`. Cookies set (if applicable). |
| **IT-API-002** | **POST /auth/login - JSON Syntax Error** | Send body: `{ "email": "messy... ` (unclosed). | HTTP 400 Bad Request (handled by framework). Application does NOT crash. |

### 3.4 Security & Compliance Integration
| Test Case ID | Description | Steps / Action | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **IT-SEC-001** | **Audit Trail Logging** | Trigger Login/Event mutation. | Verify record exists in `AuditLog` table. |
| **IT-SEC-002** | **HTTPS Enforcement** | Try insecure connection. | Connection rejected or redirected to HTTPS (if implemented). |

---

## 4. End-to-End (E2E) Tests (The "Stupid User" Scenarios)

These tests simulate real, often chaotic, user interactions.

### 4.1 Journey: Full Event Lifecycle
**Actors**: User `UserA`

| Test Case ID | Step | Action Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **E2E-FULL-01** | **Login** | POST `/auth/login` with UserA credentials. | Receive JWT Token. Store for subsequent requests. |
| **E2E-FULL-02** | **Create Event** | POST `/events` with header `Authorization: Bearer [token]`. Body: `{ "title": "My Party", "occurrence": "2026-12-31..." }`. | HTTP 201. Response body contains `id` and `ownerId`. |
| **E2E-FULL-03** | **Verify List** | GET `/events`. | HTTP 200. Array contains "My Party". |
| **E2E-FULL-04** | **Update** | PATCH `/events/{id}` with `{ "description": "Updated desc" }`. | HTTP 200. Updated field reflected. |
| **E2E-FULL-05** | **Delete** | DELETE `/events/{id}`. | HTTP 204 No Content. |

### 4.2 Journey: Admin Provisioning (MVP Auth)
**Actors**: `AdminUser`

| Test Case ID | Step | Action Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **E2E-ADMIN-01** | **Create User** | POST `/admin/users` with `{email: "new@user.com", roles: ["USER"]}`. | HTTP 201. User created. Password can be strictly generated or set. |
| **E2E-ADMIN-02** | **Login as New User** | POST `/auth/login` with new credentials. | HTTP 201. Token Received. |
| **E2E-SEC-ADM** | **RBAC Protection** | Regular User tries to POST `/admin/users`. | HTTP 403 Forbidden. |

### 4.3 Journey: Help Desk Agent Dashboard
**Actors**: `AgentUser`, `UserA`

| Test Case ID | Step | Action Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **E2E-AGENT-01** | **User Requests Help** | UserA POST `/helpdesk/chat` with message. | HTTP 200. Message stored. |
| **E2E-AGENT-02** | **Agent Views Queue** | AgentUser GET `/helpdesk/queue`. | HTTP 200. List includes UserA's chat. |
| **E2E-AGENT-03** | **Agent Replies** | AgentUser POST `/helpdesk/chat/{chatId}/reply`. | HTTP 200. Reply stored. |
| **E2E-AGENT-04** | **User Sees Reply** | UserA GET `/helpdesk/chat/history`. | HTTP 200. History includes Agent's reply. |

### 4.4 Journey: Security Barriers
**Actors**: User `UserA`, User `UserB` (Attacker)

| Test Case ID | Step | Action Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **E2E-SEC-01** | **Unauthorized Edit** | UserB tries PATCH `/events/{EventA_ID}`. | HTTP 403 Forbidden. |
| **E2E-SEC-02** | **Auth Bypass** | Attacker sets `Cookie: access_token=admin` manually. | HTTP 401 Unauthorized (Signature verification fails). |

### 4.5 Journey: "Chicken User" & Edge Case Chaos
**Actors**: `UserChaos`

| Test Case ID | Scenario | Action Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **E2E-CHAOS-01**| **The "Double Clicker"** | User sends *Create Event* request 20 times in 1 second (simulating rage clicking). | 20 Requests received. Rate Limiter blocks 10+. Only 1 (or intended number) events created if deduped, otherwise 20 distinct events. **System does NOT crash.** |
| **E2E-CHAOS-02**| **The "Novelist"** | User tries to use the *Help Desk Chat* to paste the entire text of "War and Peace" (500KB string). | HTTP 413 Payload Too Large (Nginx/NestJS limit). If passed, API validates max length (e.g., 2000 chars) and returns 400. |
| **E2E-CHAOS-03**| **The "Time Traveler"** | User manually edits API request to set event date to `0000-01-01T00:00:00Z`. | HTTP 400 Bad Request. Date validation schema rejects crazy dates. |
| **E2E-CHAOS-04**| **The "Script Kiddie"** | User sets Event Title to `<script>alert('pwned')</script>`. | API accepts it (as data), BUT E2E test verifies that dealing with this data in Frontend renders it as **TEXT**, not HTML. |
| **E2E-CHAOS-05**| **The "Ghost"** | User deletes their account, then immediately tries to List Events reusing the old JWT. | HTTP 401 Unauthorized. (Token might be valid, but User check fail or Token Revocation List check). |
| **E2E-CHAOS-06**| **The "Unicode Lover"** | User registers email: `admin@exampIe.com` (Capital 'i' looks like 'l'). | System treats as distinct email. Standard Phishing protection applies. |

### 4.6 Journey: Compliance & Auditing
| Test Case ID | Step | Action Description | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **E2E-AUDIT-01** | **Full Audit Trail** | Login -> Create Event -> Request Reset. | Admin can see audit logs for all these actions. |

---

## 5. Security & Performance Limits

### 5.1 Hard Limits
- **Max JSON Body**: 100kb (Strict limit to prevent memory exhaustion).
- **Rate Limit**: 100 requests / min / IP.
- **Max Event Title**: 150 characters.
- **Max Event Description**: 5000 characters.

### 5.2 Performance Smoke Tests
- **PERF-001**: 100 concurrent Login requests. **Goal**: P95 latency < 500ms.
- **PERF-002**: Help Desk Chat latency. **Goal**: Response < 3s (External API dependency).

---

## 6. Frontend Specific Test Plan

### 6.1 Unit & Component Tests Strategy
We use **Jest + React Testing Library** to verify UI behavior in isolation.

#### Critical Component Tests
-   **EventForm**: Verifies validation logic (e.g., past dates, length limits) and submission handling.
-   **ChatWindow**: Verifies real-time message rendering, scrolling, and typing indicators.
-   **EventList**: Verifies empty states, loading skeletons, and responsive rendering.

#### Core Hook Tests
-   **useAuth**: Verifies login/logout state transitions and token storage.
-   **useChat**: Verifies optimistic UI updates and error rollback.
-   **useEvents**: Verifies CRUD operations and state synchronization with backend.

### 6.2 Frontend Integration Tests
Verify the interaction between components and the API client.
-   **Form Workflows**: Complete form submission cycles including validation error handling.
-   **Auth State**: Persistence of authentication across page reloads.

### 6.3 Validated Frontend Requirements (Traceability)
-   **FE-AUTH-001**: Login/Logout flow verified by `useAuth.test.ts` & `auth-login.spec.ts`.
-   **FE-EVENT-001**: Event CRUD verified by `useEvents.test.ts` & E2E tests.
-   **FE-HELP-001**: Chat interface verified by `useChat.test.ts`.
-   **FE-SEC-001**: Token handling verified by API Client tests.

---
## 7. Execution Environment & Infrastructure

### 7.1 Backend Test Infrastructure
To ensure test reliability and isolation, the backend requires a managed database environment.

- **Docker-Managed Execution (Recommended)**:
  Run all tests using the provided PowerShell script: `powershell ./scripts/run-all-tests.ps1`.
  - **Requirement**: Docker Desktop / Engine must be installed and running.
  - **Behavior**: The script spins up a temporary PostgreSQL container, pushes the Prisma schema, executes all test tiers, and destroys the container afterwards.

- **Manual/Individual Execution**:
  When running `npm run test` (unit), `powershell ./scripts/run-integration-tests.ps1`, or `powershell ./scripts/run-e2e-tests.ps1` individually:
  - **Unit Tests**: No database required (uses mocks).
  - **Integration & E2E Tests**: Requires a background PostgreSQL instance.
  - **Required Configuration**:
    - **Host**: `localhost`
    - **Port**: `5432`
    - **User**: `test_user`
    - **Password**: `test_password`
    - **Database**: `test_db`
  - **Prisma Sync**: Ensure `npx prisma db push` has been run against the test database before starting.

---
**Prepared by Test Manager**
*Last Updated: 2026-02-15*

