# Event Management System

A full-stack event management application with AI-powered help desk, built with NestJS, Next.js, and PostgreSQL.

## 🚀 Quick Start with Docker (Recommended)

The fastest way to run the entire application stack:

```bash
# 1. Clone the repository (if not already done)
git clone <repository-url>
cd event-management-system

# 2. Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Provide SSL/TLS Certificates (Required for HTTPS)
# Create the directory if it doesn't exist:
mkdir -p backend/certs
# Place your 'server.key' and 'server.crt' in 'backend/certs/'
# (For local dev, self-signed certificates are acceptable)

# 4. Edit backend/.env and add your Gemini API key
# GEMINI_API_KEY=your-api-key-here
# (Other values can remain as defaults for Docker)

# 5. Start everything with Docker Compose
docker-compose up --build
```

### ⚡ **First Time Setup**

After the containers are running, you need to initialize the database:

```bash
# 1. Initialize database schema
docker exec -it event-manager-backend npx prisma db push

# 2. Seed test users
docker exec -it event-manager-backend npm run seed
```

**Access the application:**
- **Frontend**: http://localhost:3011
- **Backend API**: http://localhost:3010
- **Database**: localhost:5440

**Default Test Users:**
- Admin: `admin@example.com` / `adminpass123`
- User: `user@example.com` / `userpass123`

> **Note**: Docker Compose automatically loads environment variables from `backend/.env` and `frontend/.env.local`. The `DATABASE_URL` is automatically overridden to use Docker's internal service name (`db`) instead of `localhost`.

## 📋 Prerequisites

- **Docker & Docker Compose** (recommended)
  - OR Node.js 18+ and PostgreSQL 15+ (for local development)
- **Gemini API Key** (for AI help desk functionality)

## 🛠️ Local Development Setup (Without Docker)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your database URL and Gemini API key

# Set up SSL/TLS Certificates
mkdir -p certs
# Place 'server.key' and 'server.crt' into 'backend/certs/'

# Set up database
npx prisma generate
npx prisma db push

# Seed test users (optional)
npm run seed

# Run development server
npm run start:dev
```

Backend will run on **http://localhost:3000**

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local if backend is not on localhost:3000

# Run development server
npm run dev
```

Frontend will run on **http://localhost:3001** (or port shown in terminal)

## 🧪 Running Tests

### Backend Tests

Testing the backend requires specific infrastructure depending on how you run the tests:

- **Full Suite (Automatic)**: Requires **Docker**. The script manages the database lifecycle.
  ```bash
  cd backend
  powershell ./scripts/run-all-tests.ps1
  ```
- **Individual Tests (Manual)**: Requires a **PostgreSQL database running in the background** (specifically configured with user `test_user`, password `test_password`, and db `test_db`).
  ```bash
  cd backend
  # Unit tests (No DB required)
  npm run test
  # Integration/E2E (Requires background DB)
  powershell ./scripts/run-integration-tests.ps1
  powershell ./scripts/run-e2e-tests.ps1
  ```

| Level | Command | Requirements |
| :--- | :--- | :--- |
| **Full Suite** | `powershell ./scripts/run-all-tests.ps1` | Docker |
| **Unit** | `npm run test` | None |
| **Integration**| `powershell ./scripts/run-integration-tests.ps1` | Background DB |
| **E2E** | `powershell ./scripts/run-e2e-tests.ps1` | Background DB |
| **Coverage** | `npm run test:cov` | None (Unit coverage) |

### Frontend Tests

```bash
cd frontend

# Run all tests (watch mode)
npm test

# Run tests once (CI mode)
npm run test:ci

# Test coverage
npm run test:coverage
```

**Current Status**: ✅ **96/96 tests passing** (100% pass rate)

## 📚 Architecture Overview

### Technology Stack

**Backend:**
- NestJS (TypeScript)
- PostgreSQL + Prisma ORM
- JWT Authentication
- Google Gemini AI (Help Desk)
- Argon2 (Password Hashing)

**Frontend:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- Axios (HTTP Client)

### Key Features

1. **User Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (USER, AGENT, ADMIN)
   - Secure password reset flow

2. **Event Management**
   - Create, read, update, delete events
   - Owner-based access control
   - Date/time validation

3. **AI-Powered Help Desk**
   - Automated AI responses using Google Gemini
   - Chat history persistence
   - Agent dashboard for human escalation

4. **Admin Panel**
   - User provisioning with role assignment
   - Temporary password generation
   - User management interface

5. **Security & Compliance**
   - Centralized audit logging
   - HTTPS/TLS support (via reverse proxy)
   - OWASP Top 10 mitigations
   - Input validation (client & server)

## 🐳 Docker Deployment

### Production Build

```bash
# Build production images
docker-compose build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Services

- **backend**: NestJS API server
- **frontend**: Next.js web application
- **db**: PostgreSQL 15 database

**Docker Networking:**
- Frontend and backend communicate via Docker service names internally
- Host machine accesses services via localhost ports

See `DOCKER_NETWORKING.md` for detailed networking explanation.

## 📖 Documentation

- **System Requirements**: `Requirements_System_Architecture/system_requirements.md`
- **Test Plan**: `TestPlan/test_plan.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Backend Guide**: `backend/README.md`
- **Frontend Guide**: `frontend/README.md`
- **Docker Networking**: `DOCKER_NETWORKING.md`
- **Documentation Index**: `DOCUMENTATION.md`

## 🔑 Environment Variables

### Backend (.env)

```env
# PostgreSQL Credentials (shared with Docker Compose)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=event_manager

# Database Connection URL
# Local development: uses localhost
# Docker: automatically uses 'db' service name
DATABASE_URL=postgresql://postgres:password@localhost:5432/event_manager?schema=public

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here

# Application
NODE_ENV=development
```

**Important**: 
- The `POSTGRES_*` variables are used by Docker Compose to configure the database container
- `DATABASE_URL` is automatically modified in Docker to use `db` instead of `localhost`
- Keep credentials consistent between `POSTGRES_PASSWORD` and the password in `DATABASE_URL`

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🎯 API Endpoints

**Authentication:**
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/request-password-reset` - Request password reset
- `POST /auth/reset-password` - Reset password with token

**Events:**
- `GET /events` - List user's events
- `POST /events` - Create event
- `GET /events/:id` - Get event details
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event

**Help Desk:**
- `POST /helpdesk/chat` - Send message (auto AI reply)
- `GET /helpdesk/chat/history` - Get chat history
- `GET /helpdesk/queue` - Get support queue (AGENT/ADMIN)
- `POST /helpdesk/chat/:userId/reply` - Agent reply

**Admin:**
- `POST /admin/users` - Provision new user (ADMIN)
- `GET /admin/users` - List all users (ADMIN)

**User:**
- `DELETE /users/me` - Delete own account

See `backend/openapi.yaml` for complete API specification.

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Reset database
docker-compose down -v
docker-compose up -d db
cd backend && npx prisma db push
```

### Port Conflicts
```bash
# Check what's using ports 3000/3001
# Windows:
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill processes or change ports in docker-compose.yml
```

### Frontend Can't Connect to Backend
- Verify backend is running: `curl http://localhost:3000/health`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Clear browser cache and restart frontend

### AI Responses Not Working
- Verify `GEMINI_API_KEY` is set in `backend/.env`
- Check Gemini API quota: https://aistudio.google.com/app/apikey
- Review backend logs: `docker-compose logs backend`

## 📝 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write Tests First (TDD)**
   ```bash
   # Backend
   cd backend
   npm test -- --watch

   # Frontend
   cd frontend
   npm test
   ```

3. **Implement Feature**
   - Follow existing code structure
   - Maintain test coverage >80%

4. **Run All Tests**
   ```bash
   # Backend
   cd backend && npm run test:all

   # Frontend
   cd frontend && npm run test:ci
   ```

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: description of feature"
   git push origin feature/your-feature-name
   ```

## 🤝 Contributing

1. Follow TDD methodology
2. Maintain >80% test coverage
3. Use TypeScript strict mode
4. Follow existing code patterns
5. Update documentation as needed

## 📄 License

This project is part of a technical assessment submission.

## 👥 Authors

- **Backend Implementation**: NestJS + Prisma + Gemini AI
- **Frontend Implementation**: Next.js + React + Tailwind CSS
- **Testing Strategy**: TDD with Jest + React Testing Library

---

**Project Status**: ✅ Production Ready  
**Test Coverage**: Backend >85% | Frontend 100% (96/96 passing)  
**Last Updated**: February 14, 2026
