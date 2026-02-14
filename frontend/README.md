# Event Management System - Frontend

Welcome to the frontend application for the Event Management System. This is a modern, responsive Single Page Application (SPA) built with [Next.js](https://nextjs.org/) and styled with [Tailwind CSS](https://tailwindcss.com/).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend server running (typically on http://localhost:3000)

### Installation

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    - Copy `.env.example` to `.env.local`
    - Update the variables if your backend is running on a different port.
    ```bash
    cp .env.example .env.local
    ```
    *Example `.env.local`:*
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:3000
    ```

### Running Development Server

Start the development server with hot-reload:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (or the port shown in your terminal) to view the application.

## 🏗️ Architecture & Implementation

This project follows a strict **Component-Based Architecture** ensuring separation of concerns and reusability.

### Technology Stack
-   **Framework:** Next.js 14+ (App Router)
-   **Language:** TypeScript 5+ (Strict Mode)
-   **Styling:** Tailwind CSS
-   **State Management:** React Context API + Custom Hooks
-   **Form Handling:** React Hook Form + Zod Validation
-   **Testing:** Jest + React Testing Library

### Key Directories
-   `/app`: Next.js App Router pages and layouts.
    -   `(auth)`: Public authentication routes (Login, Password Reset).
    -   `(protected)`: Secured application routes (Dashboard, Events, Help Desk).
-   `/components`: Reusable UI components.
    -   `/ui`: Generic atoms (Button, Input, Modal, Toast).
    -   `/events`: Event-specific components (Card, List, Form).
    -   `/help`: Chat interface components.
    -   `/admin`: User management tables and forms.
-   `/lib`: Core logic and utilities.
    -   `/api`: Axios client configuration and interceptors.
    -   `/hooks`: Custom hooks for data fetching (`useEvents`, `useChat`, `useAuth`).
    -   `/validators`: Zod schemas for form validation.
    -   `/utils`: Helper functions (date formatting, error handling).

### Core Features Implementation

1.  **Authentication & Security**
    -   Implemented using `AuthContext` and specialized hooks.
    -   JWT tokens are stored securely (HTTP-only cookies recommended in production, simulated here via storage for demo).
    -   Protected routes redirects unauthenticated users.

2.  **Event Management**
    -   Full CRUD operations via `useEvents` hook.
    -   Optimistic UI updates for better perceived performance.
    -   Form validation ensures data integrity before API calls.

3.  **AI Help Desk via RAG**
    -   `useChat` hook manages the conversation state.
    -   Real-time chat interface with auto-scrolling and typing indicators.
    -   Connects to backend endpoints that utilize Gemini AI.

4.  **Admin Panel**
    -   Role-based access control (RBAC) restricts access to `/admin`.
    -   User provisioning flow with role assignment.

## 🧪 Testing

We adhere to **Test-Driven Development (TDD)**. The codebase maintains high test coverage.

### Running Tests

-   **Run Unit Tests:**
    ```bash
    npm run test
    ```
-   **Run Tests in CI Mode (Single pass):**
    ```bash
    npm run test:ci
    ```
-   **Watch Mode (for development):**
    ```bash
    npm run test:watch
    ```

### Test Structure
-   `*.test.tsx`: Unit tests colocated with components.
-   `*.test.ts`: Hook and utility tests.
-   Tests verify rendering, user interactions, accessibility, and error handling.

## 📦 Deployment

### Local Production Build

1.  **Build the application:**
    ```bash
    npm run build
    ```
    This creates an optimized production build in the `.next` folder.

2.  **Start production server:**
    ```bash
    npm start
    ```

### Docker Deployment

Run the frontend in a Docker container:

1.  **Build the image:**
    ```bash
    docker build -t event-manager-frontend .
    ```

2.  **Run the container:**
    ```bash
    docker run -p 3001:3000 -e NEXT_PUBLIC_API_URL=http://localhost:3000 event-manager-frontend
    ```

### Full Stack with Docker Compose

From the project root, run both frontend and backend:

```bash
docker-compose up --build
```

This starts:
- Backend API on `http://localhost:3000`
- Frontend on `http://localhost:3001`
- PostgreSQL database on port `5432`

## 🤝 Contributing

1.  Ensure all new components have associated unit tests.
2.  Run `npm run lint` to check for style issues.
3.  Follow the established folder structure.

---
*Documentation generated for Event Management System Frontend*
