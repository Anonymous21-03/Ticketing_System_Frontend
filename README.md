# 🎫 Ticketing System Frontend

A simple, responsive, and easy-to-use Ticketing and Incident Management dashboard. Built with React 19, Vite, and Vanilla CSS, this application provides a clean interface for tracking support tickets, assigning them to teams, viewing basic analytics, and managing users.

Live Demo: [https://ticketing-system-frontend-lilac.vercel.app/](https://ticketing-system-frontend-lilac.vercel.app/)

Backend API Repo: [https://github.com/Anonymous21-03/Ticketing_System_Backend](https://github.com/Anonymous21-03/Ticketing_System_Backend)

---

## Features

- **Dashboard and Analytics**:
  - View key metrics like open, in-progress, resolved, and high-priority tickets.
  - Interactive charts (using Recharts) to see ticket status, priority, and daily creation rates.
- **Ticket Management**:
  - Search, filter, and page through support tickets.
  - Change ticket status (Open, In Progress, Resolved) and priority (Low, Medium, High).
  - Open a detailed ticket view to update assignees and post comments.
- **User Directory**:
  - Manage users, assign roles (Admin vs. User), and reset passwords.
- **Team Management**:
  - Create and organize teams and departments.
- **Authentication**:
  - Secure login with role-based routing.
  - Keeps user logged in using secure token storage in localStorage.
- **Modern Styling**:
  - Sleek design using HSL colors, CSS variables, and responsive layouts.

---

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Styling**: Vanilla CSS

---

## Project Structure

```
Ticketing_System_Frontend/
├── public/                 # Static files and SVG icons
├── src/
│   ├── assets/             # Images and design assets
│   ├── components/
│   │   ├── layout/         # Header, Sidebar, and overall layout
│   │   ├── ui/             # Reusable UI parts like buttons, tables, and modals
│   │   └── ProtectedRoute  # Route guards for authentication
│   ├── context/            # Auth context for user state
│   ├── pages/              # Main pages (Dashboard, Tickets, Login, etc.)
│   ├── services/           # Axios setup and API calls
│   ├── styles/             # Global CSS and HSL styling variables
│   ├── App.jsx             # App router and notification setup
│   └── main.jsx            # Entry point
├── .env                    # Environment variables configuration
├── eslint.config.js        # Linter rules
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite config
```

---

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm** or **yarn** package manager

### Setup and Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Anonymous21-03/Ticketing_System_Frontend.git
   cd Ticketing_System_Frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root folder and add your backend URL:
   ```env
   VITE_API_URL=https://ticketing-system-backend-wpux.onrender.com/
   ```

### Running Locally

To start the development server:
```bash
npm run dev
```

To build the project for production:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## Authentication and Roles

Access and permissions are controlled based on three user roles:

- **Admin Role**: Full system access. Can view the user directory, manage teams/departments, create users, edit roles, and reset user passwords.
- **Agent Role**: Customer support agent or developer. Can view, manage, and comments on tickets, and assign tickets to themselves or team members.
- **Employee Role**: Regular end-user. Can create new support tickets, view their tickets, add comments, and update status on their tickets.

### Demo / Trial Accounts

You can log in to the application using any of the following pre-seeded trial accounts. The default password for **all accounts** is:

🔑 **Password:** `Password@123`

| Role | Username | Example User | Department / Team |
| :--- | :--- | :--- | :--- |
| **Admin** | `rahul` | Rahul Sharma | *(Global / No Team)* |
| **Admin** | `priya` | Priya Verma | *(Global / No Team)* |
| **Agent** | `rohan` | Rohan Gupta | Frontend |
| **Agent** | `kavita` | Kavita Joshi | Backend |
| **Agent** | `ankit` | Ankit Mehta | Platform Engineering |
| **Agent** | `meera` | Meera Nair | QA & Testing |
| **Agent** | `vikram` | Vikram Singh | DevOps |
| **Employee** | `pooja` | Pooja Desai | Frontend |
| **Employee** | `deepak` | Deepak Rao | Platform Engineering |
| **Employee** | `amit` | Amit Tiwari | *(No Team)* |


