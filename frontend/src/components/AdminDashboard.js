import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardOverview from './DashboardOverview';
import CollectionsApproval from './CollectionsApproval';
import MemberManagement from './MemberManagement';
import NewsManagement from './NewsManagement';
import './AdminDashboard.css';

const AdminDashboard = () => {
  console.log('AdminDashboard Component Rendered');

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="admin-content">
        <Routes>
          {/* Default Route */}
          <Route index element={<DashboardOverview />} />
          {/* Sub Routes */}
          <Route path="overview" element={<DashboardOverview />} />
          <Route path="collections" element={<CollectionsApproval />} />
          <Route path="members" element={<MemberManagement />} />
          <Route path="news" element={<NewsManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
