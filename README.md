<h1 align="center">
  <br />
  ☑️ Task-It
  <br />
</h1>

<h4 align="center">A premium, full-stack SaaS project management platform built with the MERN stack.</h4>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#project-structure">Project Structure</a>
</p>

---

## Overview

**Task-It** is a fully featured, role-based project management SaaS application designed for modern teams. It offers separate, purpose-built dashboards for **Admins** and **Members**, a Kanban-style project board, real-time task tracking, team management, and a sleek premium interface inspired by Apple's design language.

The platform enforces a strict security model — admins manage projects and teams, while members work within their assigned scope. Invited members are given temporary credentials and are required to change their password on first login.

---

## Features

### 🔐 Authentication & Security
- **JWT-based authentication** with 7-day token expiry
- **Role-based access control** (`admin` / `member`)
- **Forced password change** for invited members on first login
- Public routes guard (redirects authenticated users away from login/signup)
- Protected routes guard (redirects unauthenticated users to login)
- Automatic session invalidation on 401 responses

### 👑 Admin Dashboard
- **Project Overview** — Total projects, active tasks, completion rates
- **Team Summary** — Member count with activity indicators
- **Quick Stats** — Tasks by priority and status breakdown
- **Recent Activity Feed** — Live feed of recent project actions
- Full CRUD control over projects and tasks

### 👤 Member Dashboard
- **Personal Productivity Summary** — Assigned tasks, completion rate, overdue items
- **Today's Tasks** — Tasks due today with urgency indicators
- **My Projects** — Projects the member is assigned to
- **Activity Feed** — Personal action history

### 📁 Project Management
- Create, edit, and delete projects (Admin only)
- Assign multiple team members to a project
- Per-project task statistics (total, completed, progress %)
- Detailed project view with Kanban board

### 📋 Task Management
- Create tasks with title, description, status, priority, deadline, and assignee
- **Kanban Board** — Drag-and-drop tasks across columns (`To Do`, `In Progress`, `Review`, `Completed`)
- Task detail drawer with full edit capabilities
- Filter tasks by status and priority
- Task progress tracked per project

### 👥 Team Management
- View all members across the organization
- **Invite Member** — Admin can create member accounts with a default temporary password (`TaskIt123!`)
- Remove members from the organization
- Role badges and email display per member card

### 🔍 Global Search
- Debounced live search (triggers after 2+ characters, 400ms delay)
- Searches across both **Projects** and **Tasks** simultaneously
- Results grouped by type with clickable navigation links

### 🔔 Notifications
- In-app notification system
- Mark individual notifications as read
- Fetches last 20 notifications per user

### ⚙️ Settings
- Update profile (name, email)
- Change password with current password verification

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI Framework |
| Vite | 5.2 | Build Tool & Dev Server |
| React Router DOM | 6.23 | Client-side Routing |
| Tailwind CSS | 4.0 | Utility-first CSS Styling |
| Axios | 1.6 | HTTP Client |
| @dnd-kit | 6.3 / 10.0 | Drag-and-Drop (Kanban) |
| Lucide React | 0.378 | Icon Library |
| React Hot Toast | 2.4 | Toast Notifications |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | — | Runtime |
| Express | 5.2 | Web Framework |
| MongoDB | — | Database |
| Mongoose | 9.6 | ODM / Schema Definition |
| bcryptjs | 3.0 | Password Hashing |
| jsonwebtoken | 9.0 | JWT Authentication |
| dotenv | 17.4 | Environment Variable Management |
| cors | 2.8 | Cross-Origin Resource Sharing |
| nodemon | 3.1 | Development Auto-restart |

### Design System
- **Font**: `Space Grotesk` (body) + `Geist` (headings)
- **Palette**: Deep Black `#030303`, Orange `#F5601A`, Neutral Gray `#989898`, Soft White `#FAFAFA`
- **Style**: Premium glassmorphism with `backdrop-filter: blur(24px)`, subtle shadows, and smooth micro-animations
- **Radii**: 9999px (pills), 48px (cards), 28px (modals), 24px (inputs)

---

## Architecture

```
task-it/
├── backend/          # Express REST API
└── frontend/         # React SPA (Vite)
```

### System Design

```
┌─────────────────────────────────────────────┐
│                   Browser                   │
│   React SPA (Vite) — Port 5173             │
│   - AuthContext (JWT stored in localStorage)│
│   - Axios interceptor (auto-attach token)  │
└──────────────────┬──────────────────────────┘
                   │ HTTP REST (JSON)
                   ▼
┌─────────────────────────────────────────────┐
│           Express API — Port 5000           │
│   - JWT protect middleware                  │
│   - Role-based authorizeRoles middleware    │
│   - Error handler middleware                │
└──────────────────┬──────────────────────────┘
                   │ Mongoose ODM
                   ▼
┌─────────────────────────────────────────────┐
│              MongoDB Atlas                  │
│   Collections: users, projects,             │
│                tasks, notifications         │
└─────────────────────────────────────────────┘
```

### Role & Access Model

```
Admin
 ├── Create / Edit / Delete Projects
 ├── Add / Remove Members (org-wide)
 ├── Create / Edit / Delete Tasks (in own projects)
 ├── View Admin Dashboard (aggregated stats)
 └── View all Projects they created

Member
 ├── View Projects they are assigned to
 ├── View / Update status of their assigned Tasks
 ├── View Member Dashboard (personal stats)
 └── Forced to change password on first login (if invited)
```

---

## Getting Started

### Prerequisites
- Node.js `>= 18.x`
- npm `>= 9.x`
- A MongoDB connection string (local or [MongoDB Atlas](https://cloud.mongodb.com))

### 1. Clone the Repository

```bash
git clone https://github.com/raghavg02/task-it.git
cd task-it
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

Start the backend development server:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be running at `http://localhost:5173`.

### 4. First Time Usage

1. Navigate to `http://localhost:5173/signup`
2. Create an **Admin** account
3. Log in — you will land on the Admin Dashboard
4. Go to **Team** → **Invite Member** to add team members
5. Invited members use the default password `TaskIt123!` and must change it on first login

---

## API Reference

**Base URL:** `http://localhost:5000/api`

All protected routes require the `Authorization: Bearer <token>` header.

---

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Login and receive JWT |

**Signup Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (min 6 chars)",
  "role": "admin | member"
}
```

**Login Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

---

### Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users/members` | Admin | Get all members |
| `POST` | `/users/invite` | Admin | Invite a new member |
| `DELETE` | `/users/:id` | Admin | Remove a member |
| `PATCH` | `/users/profile` | Authenticated | Update own profile |
| `PATCH` | `/users/change-password` | Authenticated | Change password |
| `GET` | `/users/notifications` | Authenticated | Get last 20 notifications |
| `PATCH` | `/users/notifications/:id/read` | Authenticated | Mark notification as read |

**Invite Member Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "role": "member | admin"
}
```
> Invited members are created with the default password `TaskIt123!` and `needsPasswordChange: true`.

---

### Projects

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/projects` | Authenticated | Get all accessible projects (with stats) |
| `POST` | `/projects` | Admin | Create a new project |
| `GET` | `/projects/:id` | Authenticated | Get a single project with task stats |
| `PUT` | `/projects/:id` | Admin (owner) | Update a project |
| `DELETE` | `/projects/:id` | Admin (owner) | Delete project and all its tasks |
| `PATCH` | `/projects/:id/members` | Admin (owner) | Add members to a project |
| `DELETE` | `/projects/:id/members/:memberId` | Admin (owner) | Remove a member from a project |

**Create Project Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "members": ["userId1", "userId2"]
}
```

---

### Tasks

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/tasks` | Authenticated | Get all tasks (filtered by role) |
| `POST` | `/tasks` | Admin | Create a new task |
| `GET` | `/tasks/:id` | Authenticated | Get a single task |
| `PATCH` | `/tasks/:id` | Authenticated | Update a task |
| `DELETE` | `/tasks/:id` | Admin | Delete a task |
| `GET` | `/tasks/project/:projectId` | Authenticated | Get all tasks for a project |

**Create Task Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "status": "todo | in-progress | review | completed",
  "priority": "low | medium | high",
  "deadline": "ISO date string",
  "assignedTo": "userId",
  "project": "projectId"
}
```

---

### Dashboard

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/dashboard/admin` | Admin | Admin aggregated stats |
| `GET` | `/dashboard/member` | Member | Member personal stats |

---

### Search

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/search?q=<query>` | Authenticated | Search projects and tasks |

---

## Project Structure

```
task-it/
│
├── backend/
│   └── src/
│       ├── config/
│       │   └── db.js                    # MongoDB connection
│       ├── controllers/
│       │   ├── auth.controller.js       # Login, Signup
│       │   ├── user.controller.js       # Profile, Invite, Notifications
│       │   ├── project.controller.js    # Full Project CRUD
│       │   ├── task.controller.js       # Full Task CRUD
│       │   ├── dashboard.controller.js  # Admin & Member stats
│       │   └── search.controller.js     # Global search
│       ├── middleware/
│       │   ├── auth.middleware.js       # JWT protect
│       │   ├── role.middleware.js       # authorizeRoles
│       │   └── error.middleware.js      # Global error handler
│       ├── models/
│       │   ├── user.model.js            # User schema (name, email, role, needsPasswordChange)
│       │   ├── project.model.js         # Project schema (title, description, createdBy, members)
│       │   ├── task.model.js            # Task schema (title, status, priority, deadline, assignedTo)
│       │   └── notification.model.js    # Notification schema
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── user.routes.js
│       │   ├── project.routes.js
│       │   ├── task.routes.js
│       │   ├── dashboard.routes.js
│       │   └── search.routes.js
│       ├── utils/
│       │   ├── asyncHandler.js          # Async error wrapper
│       │   └── apiError.js              # Structured error class
│       └── server.js                    # Express app entry point
│
└── frontend/
    └── src/
        ├── assets/
        │   └── auth_bg.png              # Auth page background
        ├── components/
        │   ├── AddMemberModal.jsx       # Admin: invite new member
        │   ├── CreateProjectModal.jsx   # Admin: create new project
        │   ├── CreateTaskModal.jsx      # Admin: create task in a project
        │   ├── EditProjectModal.jsx     # Admin: edit project details
        │   ├── ForcePasswordChangeModal.jsx  # Forced on first login
        │   ├── KanbanBoard.jsx          # Drag-and-drop board
        │   ├── NotificationDropdown.jsx # Bell icon dropdown
        │   ├── ProjectCard.jsx          # Project summary card
        │   ├── RoleSelector.jsx         # Admin/Member toggle on auth pages
        │   ├── TaskCard.jsx             # Task summary card (Kanban)
        │   ├── TaskDetailsDrawer.jsx    # Sliding task detail panel
        │   └── TaskItem.jsx             # Task row (list view)
        ├── context/
        │   └── AuthContext.jsx          # Global auth state, login/logout
        ├── layouts/
        │   ├── AuthLayout.jsx           # Login/Signup shell
        │   └── MainLayout.jsx           # Dashboard shell (sidebar, header, search)
        ├── pages/
        │   ├── Dashboard.jsx            # Admin dashboard
        │   ├── MemberDashboard.jsx      # Member dashboard
        │   ├── Projects.jsx             # Project list page
        │   ├── ProjectDetails.jsx       # Single project + Kanban
        │   ├── Tasks.jsx                # All tasks list page
        │   ├── TeamManagement.jsx       # Team member management
        │   ├── Settings.jsx             # Profile & password settings
        │   ├── Login.jsx                # Login form
        │   └── Signup.jsx               # Signup form
        ├── routes/
        │   ├── AppRoutes.jsx            # Route definitions
        │   ├── ProtectedRoute.jsx       # Redirect if not authenticated
        │   └── PublicRoute.jsx          # Redirect if already authenticated
        ├── services/
        │   └── api.js                   # Axios instance with interceptors
        ├── App.jsx                      # Root component
        ├── main.jsx                     # React DOM entry point
        └── index.css                    # Global styles & design system
```

---

## Database Schema

### User
```js
{
  name:                String (required),
  email:               String (unique, required),
  password:            String (hashed, min 6 chars),
  role:                "admin" | "member",
  needsPasswordChange: Boolean (default: false),
  createdAt:           Date,
  updatedAt:           Date
}
```

### Project
```js
{
  title:       String (required),
  description: String (required),
  createdBy:   ObjectId → User,
  members:     [ObjectId → User],
  createdAt:   Date,
  updatedAt:   Date
}
```

### Task
```js
{
  title:       String (required),
  description: String (required),
  status:      "todo" | "in-progress" | "review" | "completed",
  priority:    "low" | "medium" | "high",
  deadline:    Date (required),
  assignedTo:  ObjectId → User,
  project:     ObjectId → Project,
  createdBy:   ObjectId → User,
  createdAt:   Date,
  updatedAt:   Date
}
```

### Notification
```js
{
  recipient:   ObjectId → User,
  message:     String,
  isRead:      Boolean (default: false),
  createdAt:   Date
}
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port for the Express server | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing JWTs | `my_super_secret_key_123` |

---

## Available Scripts

### Backend
```bash
npm run dev       # Start with nodemon (hot-reload)
```

### Frontend
```bash
npm run dev       # Start Vite dev server
npm run build     # Build for production
npm run preview   # Preview the production build
```

---

## Key Design Decisions

1. **Separate Dashboards**: Admin and Member users see entirely different dashboards tailored to their workflow — Admins see team-wide metrics while Members see their own personal productivity data.

2. **Invited Member Flow**: When an Admin invites a member, the backend creates the account with a default password and `needsPasswordChange: true`. The `ForcePasswordChangeModal` intercepts any navigation for these users until they update their credentials.

3. **Optimistic Search UX**: The global search uses a 400ms debounce and fires only after 2+ characters, preventing unnecessary API calls while keeping the experience snappy.

4. **Drag-and-Drop Kanban**: Built with `@dnd-kit`, the Kanban board on the Project Details page allows task status changes via drag-and-drop, with immediate backend sync on drop.

5. **Z-Index Hierarchy**: A strict layering system is enforced — global navigation elements (header, dropdowns) at `z-[9999]`, page-level menus at `z-50`, and content at `z-0` — ensuring interactive menus never overlap incorrectly.


---

<p align="center">Made with ❤️ by <a href="https://github.com/raghavg02">Raghav</a></p>
