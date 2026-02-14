# 🚀 Quick Start - Postman Testing

## ✅ Setup Complete!

Your test users have been created successfully! 🎉

## 📋 Test Credentials

Use these credentials in Postman:

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | `admin@example.com` | `admin123` | Full access + user provisioning |
| **Agent** | `agent@example.com` | `agent123` | Help desk support + events |
| **User** | `user@example.com` | `password123` | Events + help desk chat |

---

## 📦 Files Created

1. ✅ **`Event-Manager-API.postman_collection.json`** - Complete Postman collection
2. ✅ **`POSTMAN_GUIDE.md`** - Detailed usage guide
3. ✅ **`scripts/seed-users.ts`** - User seeding script
4. ✅ **`QUICK_START_POSTMAN.md`** - This file!

---

## 🎯 Quick Test Flow

### 1. Import Postman Collection

1. Open **Postman**
2. Click **Import**
3. Select `Event-Manager-API.postman_collection.json`

### 2. Start Testing!

#### Test 1: Login as User
```
POST /auth/login

Body:
{
  "email": "user@example.com",
  "password": "password123"
}
```

✅ Token is auto-saved to `{{access_token}}`

#### Test 2: Create an Event
```
POST /events

Headers: 
Authorization: Bearer {{access_token}}

Body:
{
  "title": "My First Event",
  "occurrence": "2024-12-25T10:00:00.000Z",
  "description": "Test event"
}
```

✅ Event ID is auto-saved to `{{event_id}}`

#### Test 3: Ask Help Desk
```
POST /helpdesk/chat

Headers:
Authorization: Bearer {{access_token}}

Body:
{
  "content": "How do I create an event?"
}
```

✅ You'll get an AI response!

#### Test 4: List Your Events
```
GET /events

Headers:
Authorization: Bearer {{access_token}}
```

#### Test 5: Login as Admin
```
POST /auth/login

Body:
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

✅ Admin token is auto-saved to `{{admin_access_token}}`

#### Test 6: Create More Users
```
POST /admin/users

Headers:
Authorization: Bearer {{admin_access_token}}

Body:
{
  "email": "newuser@example.com",
  "roles": ["USER"]
}
```

✅ You'll get a temporary password in the response!

---

## 📊 Collection Features

### ✅ Automatic Features

- **Auto-saves JWT tokens** after login
- **Auto-saves event IDs** after creation
- **Built-in test scripts** verify responses
- **Pre-configured authentication** for all protected endpoints
- **Environment variables** for easy customization

### 📁 Collection Structure

```
Event Manager API
├── Health Check (1 endpoint)
├── Authentication (3 endpoints)
│   ├── Login - Regular User
│   ├── Login - Admin User
│   └── Refresh Token
├── Events (4 endpoints)
│   ├── Create Event
│   ├── List All Events
│   ├── Update Event
│   └── Delete Event
├── Help Desk (4 endpoints)
│   ├── Send Message
│   ├── Get Chat History
│   ├── Get Support Queue (AGENT)
│   └── Reply to User (AGENT)
├── Admin (2 endpoints)
│   ├── Create User (ADMIN)
│   └── Create Admin User
└── User Management (1 endpoint)
    └── Delete Own Account
```

---

## 🔑 Variables Reference

| Variable | Auto-Set | Description |
|----------|----------|-------------|
| `{{base_url}}` | ❌ | API base URL (default: http://localhost:3000) |
| `{{access_token}}` | ✅ | User JWT token |
| `{{refresh_token}}` | ✅ | User refresh token |
| `{{admin_access_token}}` | ✅ | Admin JWT token |
| `{{admin_refresh_token}}` | ✅ | Admin refresh token |
| `{{event_id}}` | ✅ | Last created event ID |

---

## ⚡ Pro Tips

### 1. Run Entire Collection
1. Click **Collection Runner**
2. Select **Event Manager API**
3. Click **Run**
4. Watch all tests execute automatically!

### 2. View Test Results
After each request, click **Test Results** tab to see:
- ✅ Passed assertions
- 📋 Logged data
- ⏱️ Response times

### 3. Check Console Output
Enable **Postman Console** (View → Show Postman Console) to see:
- Raw HTTP requests
- Response headers
- Debugging information

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| **401 Unauthorized** | Login again to get a fresh token |
| **403 Forbidden** | Use admin token for admin endpoints |
| **404 Not Found** | Make sure API is running: `npm run start:dev` |
| **500 Server Error** | Check terminal logs for backend errors |

---

## 🔄 Re-seed Users

If you need to reset test users:

```powershell
npx ts-node scripts/seed-users.ts
```

---

## 📚 Full Documentation

For detailed endpoint documentation, see **`POSTMAN_GUIDE.md`**

---

## 🎉 You're Ready!

Everything is set up and ready to test. Enjoy! 🚀

**Next Steps:**
1. Open Postman
2. Import the collection
3. Start testing!

---

**Need help?** Check `POSTMAN_GUIDE.md` for detailed instructions.
