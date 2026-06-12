# SupportFlow - Ticketing System Frontend

A full-featured React dashboard for an internal help desk system. Features role-based views for Admins, Agents, and Employees, real-time WebSocket updates, interactive analytics charts, SLA tracking with live countdowns, S3 file attachments, and a complete ticket lifecycle UI - deployed on Vercel.

**Live Demo:** [https://ticketing-system-frontend-lilac.vercel.app](https://ticketing-system-frontend-lilac.vercel.app)
&nbsp;|&nbsp; **Backend API Repo:** [Ticketing_System_Backend](https://github.com/Anonymous21-03/Ticketing_System_Backend)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router v7 |
| Charts | Recharts |
| HTTP Client | Axios (with interceptors) |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Styling | Vanilla CSS (HSL design tokens, CSS variables, glassmorphism) |
| Real-time | Native WebSocket with JWT auth |
| AI Chatbot | Collapsible panel & Floating Action Button (FAB) |
| Deployment | Vercel |

---

## Features

### AI Chatbot UI
- **Collapsible Floating Panel:** Access the AI ticketing assistant from anywhere in the application via a sleek Floating Action Button (FAB).
- **Responsive Rich Layout:** Beautifully styled with glassmorphism, nice shadows, custom animations, message bubble alignment, and typing indicators.
- **Markdown Support:** Renders rich AI responses (including bullet points, bolding, lists, and code) directly within the chat window.

### Real-Time WebSocket Updates
- Authenticated WebSocket connection using JWT tokens
- Live toast notifications on ticket creation, updates, and new comments from other users
- Automatic data refresh - dashboards and ticket detail pages update instantly without manual reload

### Role-Based Dashboard
- **Admin**: total tickets, unassigned count, SLA breaches, user/team counts, status distribution pie chart, priority breakdown bar chart, team filter dropdown to scope all metrics
- **Agent**: accessible tickets, assigned-to-me count, active/resolved split, SLA breach count
- **Employee**: personal ticket count, pending help, resolved count, SLA breaches
- Recent tickets table with quick navigation to detail view

### Ticket Management
- Search tickets by title/description, filter by status and priority, sort by any column
- Paginated list with `limit/offset` and page navigation
- Create tickets via modal with team and assignee selection (role-scoped options)
- Inline status and priority changes with **optimistic UI updates** and automatic rollback on failure
- Team-based agent filtering: assignee dropdown restricts to agents belonging to the selected team

### Ticket Detail Page
- Editable title and description (role-scoped: admin/agent freely, employee only on own open tickets)
- Properties sidebar: status, priority, team, assignee - all editable via dropdowns for admin/agent
- **SLA tracking**: live countdown showing remaining time (e.g., "4h 23m remaining"), "SLA Breached" badge, or "Completed On Time" for closed tickets
- SLA deadline display with precise `due_at` timestamp
- `resolved_at` timestamp shown when ticket has been resolved
- Soft-delete with confirmation dialog, admin-only reactivation
- Tabbed interface with three sections:
  - **Comments**: threaded comment list with create, inline edit, and delete (with confirmation dialog)
  - **Attachments**: S3-backed file upload (presign → PUT to S3 → confirm), download via fresh presigned URLs, delete with ownership check
  - **Audit History**: timeline view showing all ticket changes with field-level diffs (`old → new`)

### User Directory (Admin Only)
- Search by name, username, or email
- Filter by role, team assignment, and active/inactive status
- Sortable column headers (name, username, email, role, created_at, updated_at)
- Inline actions: edit user, reset password, deactivate/reactivate
- View assigned tickets modal: popup showing all tickets assigned to a selected user with navigation

### Team Management (Admin Only)
- Create and manage teams with description
- Team detail page: full analytics charts for admins, member roster view for agents/employees

### Profile & Security
- View profile card with username, email, role, and assigned team
- Change password with client-side validation (8+ chars, uppercase, lowercase, digit, special char)

### Auth & Session Management
- Login with username/email and password
- JWT stored in localStorage with automatic Bearer token injection via Axios interceptors
- Global 401 interceptor: auto-clears token and redirects to login on expired/revoked sessions
- Logout with server-side token revocation
- Protected routes with role-based guards (`ProtectedRoute` component with `allowedRoles`)
- Dynamic sidebar: "My Team" link appears for agents/employees assigned to a team

---

## Project Structure

```
src/
├── components/
│   ├── layout/             # AppLayout, Header, Sidebar
│   ├── ui/                 # Badge, Button, ConfirmDialog, EmptyState, Input,
│   │                       # LoadingSpinner, Modal, Pagination, SearchFilter, Table
│   ├── CreateTicketModal   # Ticket creation form
│   ├── CreateUserModal     # User create/edit form
│   ├── ResetPasswordModal  # Admin password reset
│   └── ProtectedRoute      # Auth guard with role checks
├── context/AuthContext      # React Context for user state, login, logout
├── hooks/useWebSocket       # WebSocket hook with auto-connect and message dispatch
├── pages/
│   ├── Dashboard            # Role-scoped analytics with Recharts
│   ├── TicketList           # Searchable, filterable, paginated ticket table
│   ├── TicketDetail         # Full ticket view with comments, attachments, audit
│   ├── UserList             # Admin user directory with modals
│   ├── TeamList             # Admin team management
│   ├── TeamDetail           # Team stats and member roster
│   ├── Profile              # Account settings and password change
│   ├── Login                # Auth form
│   └── NotFound             # 404 page
├── services/                # Axios API modules (auth, tickets, users, teams, comments, attachments)
├── styles/                  # CSS variables (HSL tokens) and global styles
├── App.jsx                  # Router setup with nested protected routes
└── main.jsx                 # Entry point
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
git clone https://github.com/Anonymous21-03/Ticketing_System_Frontend.git
cd Ticketing_System_Frontend
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=https://ticketing-system-backend-wpux.onrender.com
```

### Run

```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
```

---

## Demo Accounts

Log in with any of the following pre-seeded accounts. Default password for all: **`Password@123`**

| Role | Username | Team |
|:---|:---|:---|
| **Admin** | `rahul` | Global |
| **Admin** | `priya` | Global |
| **Agent** | `rohan` | Frontend |
| **Agent** | `kavita` | Backend |
| **Agent** | `ankit` | Platform Engineering |
| **Agent** | `meera` | QA & Testing |
| **Agent** | `vikram` | DevOps |
| **Employee** | `pooja` | Frontend |
| **Employee** | `deepak` | Platform Engineering |
| **Employee** | `amit` | No Team |
