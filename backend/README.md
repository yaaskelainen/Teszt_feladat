# Event Management System - Backend

Welcome to the Event Management System backend. This is a robust, security-focused NestJS application designed to handle event creation, user management, and AI-powered help desk support, all while maintaining a comprehensive audit trail.

## 🚀 Key Features

- **Centralized Audit Logging**: Automated tracking of all security-relevant events (Login, User Creation, Event CRUD).
- **AI-Powered Help Desk**: Integrated Google Gemini Flash for automated, intelligent support responses.
- **Advanced Security**: Multi-Factor Authentication (MFA/TOTP), JWT-based session management, and Role-Based Access Control (RBAC).
- **Resilient Infrastructure**: Centralized error handling, request throttling, and comprehensive testing (Unit, Integration, E2E).

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (TypeScript)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **AI**: [Google Gemini Flash (Latest)](https://ai.google.dev/)
- **Testing**: Jest & Supertest
- **Containerization**: Docker

---

## 📥 Setup Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **Docker & Docker Compose**
- **Git**

### 2. SSL/TLS Certificates (Required)
The application is configured to run on HTTPS. You must provide SSL certificates in the following location:
- Create a directory: `backend/certs/`
- Place your certificate files inside:
  - `backend/certs/server.key`
  - `backend/certs/server.crt`

*Note: These files are ignored by Git for security. For local development, you can use self-signed certificates.*

### 3. Environment Configuration
Create a `.env` file in this directory by copying the example provided:

```bash
cp .env.example .env
```

**Required Variables**:
- `DATABASE_URL`: PostgreSQL connection string (Default: `postgresql://test_user:test_password@localhost:5432/test_db?schema=public`).
- `JWT_SECRET`: Secure string for token signing.
- `GEMINI_API_KEY`: Your Google AI API Key (required for AI Help Desk).

### 3. Initialize Database
Spin up the PostgreSQL container and push the schema:

```bash
docker-compose up -d
npx prisma db push
```

### 4. Install Dependencies & Run
```bash
npm install
npm run start:dev
```

---

## 📡 API Surface

All requests should include `Content-Type: application/json`. Protected endpoints require a `Bearer` token in the `Authorization` header.

### Authentication (`/auth`)
| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Email + Password authentication. | Public |
| `POST` | `/auth/refresh` | Issue new access token using refresh token. | Public |

### Admin Dashboard (`/admin`)
| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| `POST` | `/admin/users` | Provision new users with default password. | `ADMIN` Role |

### Event Management (`/events`)
| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| `POST` | `/events` | Create a new event. | `USER` Role |
| `GET` | `/events` | List all events owned by the user. | `USER` Role |
| `PATCH` | `/events/:id` | Update event description. | Owner only |
| `DELETE` | `/events/:id` | Delete an event. | Owner only |

### Help Desk (`/helpdesk`)
| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| `POST` | `/helpdesk/chat` | Send message to AI Help Desk. | `USER` Role |
| `GET` | `/helpdesk/history` | Retrieve user chat history. | `USER` Role |
| `GET` | `/helpdesk/queue` | View active support queue. | `AGENT`/`ADMIN` |
| `POST` | `/helpdesk/chat/:userId/reply` | Manual agent reply to user. | `AGENT`/`ADMIN` |

---

## 🧪 Testing

The project maintains a 100% success rate across three tiers of testing. 

### ⚠️ Infrastructure Requirements
- **Docker Requirement**: To run the full test suite via the managed script (`run-all-tests.ps1`), **Docker must be installed**. The script automatically builds a dedicated PostgreSQL container, runs tests, and disposes of it afterwards.
- **Manual Runs**: If running integration or E2E tests individually without the master script, a PostgreSQL database **must be running in the background** with the following configuration:
  - **User**: `test_user`
  - **Password**: `test_password`
  - **Database**: `test_db`
  - **Port**: `5432`
  - **Prisma Setup**: Run `npx prisma db push` against this test database before running tests.

### Running Tests
**Run All Tests (Easiest)**:
```bash
powershell ./scripts/run-all-tests.ps1
```

**Individual Levels**:
- **Unit**: `npm run test` (No database required)
- **Integration**: `powershell ./scripts/run-integration-tests.ps1` (Requires background DB)
- **E2E (Journey)**: `powershell ./scripts/run-e2e-tests.ps1` (Requires background DB)

---

## 📂 Project Structure

```text
src/
├── admin/          # Admin provisioning logic
├── audit/          # Centralized Audit Service & Module
├── auth/           # JWT, MFA, and Guards
├── event/          # Event CRUD domains
├── helpdesk/       # AI & Manual Chat logic
├── domain/         # Entities & Interfaces (Core logic)
├── infrastructure/ # Prisma, Repositories, Adapters (External)
└── main.ts         # App entry point
```

---

## 📜 Compliance & Auditing

The system automatically logs all critical actions to the `AuditLog` table. This includes:
- IP Address & Timestamp
- Actor (UserID)
- Action Target (Resource ID)
- Payload (Action metadata)

This ensures the platform meets high IT-SEC standards for traceability and security monitoring.
