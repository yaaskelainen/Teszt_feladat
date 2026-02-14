# Event Management System - Documentation Index

This document provides a map to all consolidated project documentation.

## 📋 Core Documentation

1.  **[System Requirements & Architecture](Requirements_System_Architecture/system_requirements.md)**
    - Complete functional and non-functional requirements.
    - Frontend-specific requirements (Section 6).
    - Data models and system constraints.

2.  **[Unified Test Plan](TestPlan/test_plan.md)**
    - Testing strategies for Backend (Unit, Integration, E2E).
    - Detailed Frontend testing strategy (Section 6).
    - Performance and security testing protocols.

3.  **[Backend Implementation Summary](IMPLEMENTATION_SUMMARY.md)**
    - Details on AI (Gemini) integration.
    - Persistent Audit Logging implementation.
    - Security and TLS termination strategies.

4.  **[Docker Networking Guide](DOCKER_NETWORKING.md)**
    - Detailed explanation of internal vs. external ports.
    - Dual environment variable strategy for Next.js (Client-side vs. SSR).

## 🚀 Setup & Deployment

- **[Main README](README.md)**: The primary entry point for:
  - Quick Start with Docker.
  - Local Development Setup.
  - Environment Variable Configuration.
  - Running the Full Test Suite.
  - First-time database initialization.

- **[Frontend README](frontend/README.md)**: Specific details for frontend developers.
- **[Backend README](backend/README.md)**: Specific details for backend developers.

## 🛠️ Maintenance & Operations

- **Database Migrations**: Handled via Prisma (`npx prisma migrate dev`).
- **Seeding**: Initial test users can be added via `npm run seed`.
- **Docker Management**: Use `docker-compose up --build` for fresh deployments.
