# 🎫 Ticketing System Frontend

A modern, responsive, and feature-rich Ticketing & Incident Management dashboard. Built with **React 19**, **Vite**, and **Vanilla CSS**, this application provides a premium user interface with robust support ticket management, team assignments, custom analytics, and administrative directory controls.

---

## ✨ Features

- **📊 Comprehensive Dashboard**: 
  - Dynamic analytics charts powered by **Recharts** visualizing ticket distribution by status, priority, and creation rate.
  - Quick-view performance metric cards for Open, In Progress, Resolved, and High-Priority tickets.
- **🎟️ Advanced Ticket Management**:
  - Grid-based search, dynamic filtration, and pagination options.
  - Multi-status workflows (Open, In Progress, Resolved) and priority indicators (Low, Medium, High).
  - Detailed Ticket view supporting real-time status/priority transitions, assignee changes, and comment threads.
- **👥 Administrative User Directory**:
  - Secure dashboard for user creation, role assignment (`admin` vs. `user`), and password reset controls.
- **🛡️ Team Organization**:
  - Custom team creation, organization, and department categorization.
- **🔐 Secure Role-Based Authentication**:
  - Custom React Router v7 routing protected by strict role authentication guards.
  - Persistent session management (via LocalStorage authorization interceptors).
- **🎨 Premium HSL-Based Theme**:
  - Clean, glassmorphism-inspired design with custom transitions, variable styling, and responsive layout.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Charts**: [Recharts 3](https://recharts.org/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Styling**: Vanilla CSS with HSL design system tokens

---

## 📂 Project Structure

```
Ticketing_System_Frontend/
├── public/                 # Static asset definitions and system SVG icons
├── src/
│   ├── assets/             # Images and project SVG illustrations
│   ├── components/
│   │   ├── layout/         # App Layout, Header, and Sidebar components
│   │   ├── ui/             # Reusable UI primitives (Buttons, Tables, Badges, Modals)
│   │   └── ProtectedRoute  # Route authentication logic & role guards
│   ├── context/            # AuthContext providers for global state management
│   ├── pages/              # Primary view controllers (Dashboard, Tickets, Login, etc.)
│   ├── services/           # Backend API interceptors and endpoint bindings
│   ├── styles/             # Global token declarations and core styling variables
│   ├── App.jsx             # Main router declaration & toast configurations
│   └── main.jsx            # Application startup node
├── .env                    # System environment definitions
├── eslint.config.js        # Linter policies
├── package.json            # Target dependency map
└── vite.config.js          # Vite build presets
```

---

## 🚀 Getting Started

### 📋 Prerequisites

- **Node.js**: `v18+` or higher recommended
- **npm** or **yarn** package manager

### ⚙️ Installation

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
   Create a `.env` file in the root directory (or use the pre-configured file) and define your backend API host url:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

### 💻 Running Locally

To launch the local development server with Hot Module Replacement (HMR):
```bash
npm run dev
```

To compile production assets:
```bash
npm run build
```

To preview the built production bundles locally:
```bash
npm run preview
```

---

## 🔒 Authentication & Access

Access to specific directory views and modules is governed by role authorization:
- **Regular Users**: Can view dashboard statistics, manage own profile details, create tickets, update status, and participate in ticket commentary.
- **Administrators (`admin`)**: Possess absolute system authority. Can additionally view administrative lists, manage teams, create and modify user roles, and trigger password resets.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
