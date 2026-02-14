# 📬 Postman API Testing Guide

## 🚀 Quick Start

### 1. Import the Collection

1. Open **Postman**
2. Click **Import** button (top-left)
3. Select `Event-Manager-API.postman_collection.json`
4. The collection will appear in your sidebar

### 2. Start Your Backend

Make sure your backend is running:

```powershell
npm run start:dev
```

The API will be available at: **http://localhost:3000**

---

## 📋 API Overview

Your Event Manager API has **6 main sections**:

| Section | Endpoints | Description |
|---------|-----------|-------------|
| **Health Check** | 1 | Verify API is running |
| **Authentication** | 3 | Login, refresh tokens |
| **Events** | 4 | CRUD operations for events |
| **Help Desk** | 4 | AI-powered chat support |
| **Admin** | 2 | User provisioning (admin only) |
| **User Management** | 1 | Account deletion |

---

## 🧪 Testing Flow (Step-by-Step)

### ✅ Step 1: Health Check

**Request:** `GET /`

This verifies your API is running.

**Expected Response:**
```
Hello World!
```

---

### ✅ Step 2: Create Your First Admin User

**⚠️ IMPORTANT:** You need to manually create the first admin user in the database!

Run this in your terminal:

```powershell
npm run start:dev
```

Then in another terminal, connect to your database and run:

```sql
-- OR use Prisma Studio
npx prisma studio
```

**Create admin via Prisma Studio:**
1. Open `http://localhost:5555`
2. Go to `User` table
3. Add new record:
   - **email**: `admin@example.com`
   - **passwordHash**: (use bcrypt hash for "admin123")
   - **roles**: `["ADMIN"]`

**Or create via code (temporary script):**

Create `scripts/create-admin.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const hash = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: hash,
      roles: ['ADMIN'],
      mfaEnabled: false,
    },
  });
  
  console.log('Admin created:', admin);
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Then run:
```powershell
npx ts-node scripts/create-admin.ts
```

---

### ✅ Step 3: Login as Admin

**Request:** `POST /auth/login - Admin User`

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

✅ The **access token** is automatically saved to `{{admin_access_token}}` variable!

---

### ✅ Step 4: Create Regular Users

**Request:** `POST /admin/users - Create User`

**Auth:** Bearer Token (uses `{{admin_access_token}}`)

**Body:**
```json
{
  "email": "user@example.com",
  "roles": ["USER"]
}
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "roles": ["USER"]
  },
  "temporaryPassword": "AkT9mP2nQ7rX"
}
```

**📝 IMPORTANT:** Copy the `temporaryPassword` - you'll need it to login!

---

### ✅ Step 5: Login as Regular User

**Request:** `POST /auth/login - Regular User`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "AkT9mP2nQ7rX"
}
```

Replace the password with the one from Step 4.

✅ The **access token** is automatically saved to `{{access_token}}` variable!

---

### ✅ Step 6: Create an Event

**Request:** `POST /events - Create Event`

**Auth:** Bearer Token (uses `{{access_token}}`)

**Body:**
```json
{
  "title": "Team Meeting",
  "occurrence": "2024-12-25T10:00:00.000Z",
  "description": "Quarterly review and planning session"
}
```

**Expected Response:**
```json
{
  "id": "event-uuid",
  "ownerId": "user-uuid",
  "title": "Team Meeting",
  "occurrence": "2024-12-25T10:00:00.000Z",
  "description": "Quarterly review and planning session",
  "createdAt": "2024-11-20T10:00:00.000Z",
  "updatedAt": "2024-11-20T10:00:00.000Z"
}
```

✅ The **event ID** is automatically saved to `{{event_id}}` variable!

---

### ✅ Step 7: Get All Events

**Request:** `GET /events - List All Events`

**Auth:** Bearer Token (uses `{{access_token}}`)

**Expected Response:**
```json
[
  {
    "id": "event-uuid",
    "title": "Team Meeting",
    "occurrence": "2024-12-25T10:00:00.000Z",
    "description": "Quarterly review and planning session"
  }
]
```

---

### ✅ Step 8: Update Event

**Request:** `PATCH /events/:id - Update Event`

**Auth:** Bearer Token (uses `{{access_token}}`)

The URL automatically uses `{{event_id}}` from Step 6!

**Body:**
```json
{
  "description": "Updated: Now includes budget review"
}
```

---

### ✅ Step 9: Test Help Desk AI

**Request:** `POST /helpdesk/chat - Send Message`

**Auth:** Bearer Token (uses `{{access_token}}`)

**Body:**
```json
{
  "content": "How do I create a new event?"
}
```

**Expected Response:**
```json
{
  "userMessage": {
    "id": "msg-uuid",
    "content": "How do I create a new event?",
    "role": "USER"
  },
  "aiReply": {
    "id": "reply-uuid",
    "content": "To create a new event, use the POST /events endpoint...",
    "role": "AI"
  }
}
```

---

### ✅ Step 10: View Chat History

**Request:** `GET /helpdesk/chat/history - Get Chat History`

**Auth:** Bearer Token (uses `{{access_token}}`)

**Expected Response:**
```json
[
  {
    "id": "msg-uuid",
    "userId": "user-uuid",
    "content": "How do I create a new event?",
    "role": "USER",
    "createdAt": "2024-11-20T10:00:00.000Z"
  },
  {
    "id": "reply-uuid",
    "userId": "user-uuid",
    "content": "To create a new event...",
    "role": "AI",
    "createdAt": "2024-11-20T10:00:01.000Z"
  }
]
```

---

## 🔐 Authentication & Authorization

### JWT Tokens

All protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The Postman collection **automatically handles this** using variables!

### Role-Based Access Control (RBAC)

| Endpoint | Required Role |
|----------|--------------|
| `POST /auth/login` | None (public) |
| `POST /auth/refresh` | None (public) |
| `POST /events` | USER |
| `GET /events` | USER |
| `PATCH /events/:id` | USER (owner only) |
| `DELETE /events/:id` | USER (owner only) |
| `POST /helpdesk/chat` | USER |
| `GET /helpdesk/chat/history` | USER |
| `GET /helpdesk/queue` | **AGENT** or **ADMIN** |
| `POST /helpdesk/chat/:userId/reply` | **AGENT** or **ADMIN** |
| `POST /admin/users` | **ADMIN** |
| `DELETE /users/me` | USER |

---

## 🧪 Test Scripts

The collection includes **automatic test scripts** that run after each request:

### What Tests Do:

1. ✅ Verify correct HTTP status codes
2. ✅ Validate response structure
3. ✅ **Auto-save tokens and IDs** to variables
4. ✅ Log important information to console

### View Test Results:

After running a request, click the **Test Results** tab to see:
- ✅ Passed tests (green)
- ❌ Failed tests (red)
- 📋 Console output

---

## 🔧 Variables Reference

The collection uses these **automatic variables**:

| Variable | Description | Set By |
|----------|-------------|--------|
| `{{base_url}}` | API base URL | Manual (default: localhost:3000) |
| `{{access_token}}` | Regular user JWT | Login endpoint |
| `{{refresh_token}}` | Regular user refresh token | Login endpoint |
| `{{admin_access_token}}` | Admin user JWT | Admin login endpoint |
| `{{admin_refresh_token}}` | Admin refresh token | Admin login endpoint |
| `{{event_id}}` | Last created event ID | Create event endpoint |

### Update Variables Manually:

1. Click on the collection name
2. Go to **Variables** tab
3. Update **Current Value**

---

## 🔄 Refresh Token Flow

When your access token expires (after 15 minutes):

1. **Request:** `POST /auth/refresh - Refresh Token`
2. The `{{refresh_token}}` variable is automatically used
3. A new `{{access_token}}` is automatically saved
4. Continue making requests!

---

## 🐛 Troubleshooting

### ❌ "401 Unauthorized"

**Cause:** Your token expired or is invalid

**Fix:**
1. Run the login request again
2. Or use the refresh token endpoint

---

### ❌ "403 Forbidden"

**Cause:** You don't have the required role

**Fix:**
1. Make sure you're using the correct token:
   - `{{admin_access_token}}` for admin endpoints
   - `{{access_token}}` for user endpoints
2. Check your user's roles in the database

---

### ❌ "404 Not Found"

**Cause:** 
- API not running
- Wrong URL
- Event ID doesn't exist

**Fix:**
1. Verify API is running: `npm run start:dev`
2. Check `{{base_url}}` variable is `http://localhost:3000`
3. Make sure you created an event first (for event endpoints)

---

### ❌ "429 Too Many Requests"

**Cause:** Rate limiting (throttling)

**Fix:**
- Wait a few seconds and try again
- You're limited to **10 requests per minute** per user

---

### ❌ "500 Internal Server Error"

**Cause:** Backend error

**Fix:**
1. Check your terminal for error logs
2. Verify database is running: `docker ps`
3. Check `.env` file has correct `DATABASE_URL`

---

## 📊 Performance Testing

### Test Help Desk Latency

The collection includes latency logging. Check the **Console** tab after sending a help desk message.

Expected latency: **< 100ms** for mock AI, **< 2000ms** for Gemini API

---

## 🎯 Full Test Sequence

Run requests in this order for a complete test:

1. ✅ Health Check
2. ✅ Login as Admin
3. ✅ Create Regular User
4. ✅ Login as Regular User
5. ✅ Create Event
6. ✅ List Events
7. ✅ Update Event
8. ✅ Send Help Desk Message
9. ✅ View Chat History
10. ✅ Delete Event
11. ✅ (Optional) Delete Account

---

## 💡 Pro Tips

### 1. Use Postman Collection Runner

1. Click **Runner** button
2. Select the collection
3. Click **Run Event Manager API**
4. All requests run automatically!

### 2. Export Environment

Save your variables for later:
1. Click collection → **Variables**
2. Click **Export**
3. Save as `Event-Manager-ENV.json`

### 3. Monitor Requests

Enable Postman Console to see all HTTP traffic:
- **View → Show Postman Console**
- See raw requests/responses

---

## 📚 Additional Resources

- **API Documentation:** See your controller files in `src/*/`
- **Test Suite:** Run `npm run test:e2e` to see integration tests
- **Database:** Use `npx prisma studio` to view data

---

## 🎉 Happy Testing!

You now have a complete Postman collection to test every endpoint in your Event Manager API!

**Questions?** Check the controller files or test files for more details on expected behavior.
