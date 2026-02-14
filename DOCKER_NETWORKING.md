# Docker Networking Explanation

## Port Mapping Clarification

### Internal vs External Ports

**Backend Service:**
```yaml
ports:
  - '3000:3000'  # host:container
```
- **Container Internal Port**: 3000 (NestJS runs on port 3000)
- **Host External Port**: 3000 (access via http://localhost:3000)

**Frontend Service:**
```yaml
ports:
  - '3001:3000'  # host:container
```
- **Container Internal Port**: 3000 (Next.js runs on port 3000)
- **Host External Port**: 3001 (access via http://localhost:3001)

### Why This Works

1. **Inside Docker Network:**
   - Services communicate using **service names**: `http://backend:3000`
   - Port conflicts don't occur because each container has its own network namespace

2. **From Host Machine:**
   - Backend: `http://localhost:3000`
   - Frontend: `http://localhost:3001`
   - Ports are mapped differently to avoid conflicts on the host

3. **From Browser (Client-Side):**
   - Browser runs on host machine, not inside Docker
   - Uses `NEXT_PUBLIC_API_URL=http://localhost:3000` to reach backend
   - This is why we need TWO environment variables for Next.js

## Environment Variables Explained

### Frontend Service
```yaml
environment:
  # For browser (client-side JavaScript)
  - NEXT_PUBLIC_API_URL=http://localhost:3000
  
  # For Next.js SSR (server-side, inside Docker)
  - API_URL=http://backend:3000
```

**Why Two URLs?**
- **`NEXT_PUBLIC_API_URL`**: Used by browser JavaScript (client-side)
  - Browser runs on your computer, not in Docker
  - Needs to use `localhost:3000` to reach the backend container
  
- **`API_URL`**: Used by Next.js SSR (server-side rendering)
  - Next.js server runs inside the frontend container
  - Uses Docker service name `backend:3000` for inter-container communication

This is a standard Docker setup pattern!
