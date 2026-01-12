# TaskHive - Collaborative Task Management App

TaskHive is a full-stack collaborative group task management web application.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Axios
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Supabase or self-hosted)
- **Authentication**: Custom JWT auth

## Features

- User authentication (register/login)
- Create and manage groups
- Invite members to groups
- Create, assign, and manage tasks
- Mark tasks as PENDING or DONE
- Collaborate with group members

## Setup Instructions

### Prerequisites

- Node.js v20+ (Compatible with Node v25)
- PostgreSQL database (Supabase or self-hosted)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `backend/.env`:
   ```
   DATABASE_URL="postgresql://user:password@host:port/database"
   JWT_SECRET="your-secret-key-change-in-production"
   PORT=5000
   ```

4. Initialize the database (creates tables):
   ```bash
   npm run init-db
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   
   Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   Frontend will run on http://localhost:3000

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Groups
- `POST /groups` - Create a new group
- `GET /groups/my` - Get all groups for current user
- `POST /groups/invite` - Invite a user to a group

### Tasks
- `POST /tasks` - Create a new task
- `GET /tasks/:groupId` - Get all tasks for a group
- `PUT /tasks/:taskId` - Update a task
- `DELETE /tasks/:taskId` - Delete a task

## Usage Flow

1. Register a new account or login
2. Create a group
3. Invite other users to your group
4. Create tasks and assign them to group members
5. Mark tasks as DONE when completed
6. All changes are saved in the database
7. Refresh the page to see updates from other users

## Database Schema

- **User**: id, name, email, password, createdAt
- **Group**: id, name, createdAt
- **GroupMember**: id, userId, groupId (with unique constraint)
- **Task**: id, title, description, status, groupId, assignedTo, createdAt

## Notes

- This app does NOT use real-time updates
- Changes are visible after page refresh
- JWT tokens are stored in localStorage
- All routes except login/register require authentication
- Database is automatically initialized on first `npm run init-db`
