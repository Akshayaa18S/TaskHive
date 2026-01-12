# TaskHive Setup Guide

## ✅ Installation Complete!

Both backend and frontend dependencies have been installed successfully.

## 🔧 Configuration Steps

### 1. Configure Supabase Database

Edit `backend/.env` and update with your Supabase PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-0-YOUR_REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
JWT_SECRET="your-secret-key-change-this-in-production"
PORT=5000
```

**To get your Supabase connection string:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → Database
4. Copy the "Connection String" (Transaction mode or Session mode)
5. Replace `[YOUR-PASSWORD]` with your database password

### 2. Initialize Database

```bash
cd backend
npx prisma generate
npx prisma db push
```

This will:
- Generate Prisma Client
- Create all tables in your database

### 3. Start the Backend

```bash
cd backend
npm run dev
```

Backend will run on: http://localhost:5000

### 4. Start the Frontend (in a new terminal)

```bash
cd frontend
npm run dev
```

Frontend will run on: http://localhost:3000

## 🎯 Test the Application

1. Open http://localhost:3000
2. Click "Register" to create a new account
3. Create a group
4. Create tasks in the group
5. Invite other users by their email

## 📝 Notes

- The warnings during npm install are normal and can be ignored
- Make sure both backend (port 5000) and frontend (port 3000) are running
- Changes require page refresh to be visible (no real-time updates)

## 🐛 Troubleshooting

**If Prisma commands fail:**
```bash
cd backend
npm install @prisma/client prisma --save
npx prisma generate
```

**If backend port 5000 is in use:**
- Change PORT in `backend/.env`
- Update baseURL in `frontend/src/utils/api.js`
