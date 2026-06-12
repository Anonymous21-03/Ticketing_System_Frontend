import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Chatbot from '../Chatbot/Chatbot';
import './AppLayout.css';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="app-main-container">
        <Header onMenuClick={toggleSidebar} />
        <main className="app-content slide-up">
          <Outlet />
        </main>
      </div>
      <Chatbot />
    </div>
  );
}
