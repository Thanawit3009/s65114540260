import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Posts from './components/Posts';
import CreatePost from './components/CreatePost';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import NewsPage from './components/NewsPage';
import ProtectedRoute from './components/ProtectedRoute';
import MyCollectionPage from './components/MyCollectionPage';
import AdminDashboard from './components/AdminDashboard';
import PublicCollectionsPage from './components/PublicCollectionsPage';
import Comments from './components/Comments';
import MemberProfile from './components/MemberProfile';
import MemberCollectionPage from './components/MemberCollectionPage';
import ReviewPage from './components/ReviewPage';
import ChatPage from './components/ChatPage';
import MessageDropdown from "./components/MessageDropdown";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import EditPost from './components/EditPost';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const isAdmin = localStorage.getItem('is_admin') === 'true';

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <Router>
      <Routes>
        {/* เส้นทางทั่วไป */}
        <Route path="/" element={<Posts />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/create" element={<ProtectedRoute condition={isLoggedIn} redirectTo="/login"><CreatePost /></ProtectedRoute>} />
        <Route path="/edit-post/:id" element={<ProtectedRoute condition={isLoggedIn} redirectTo="/login"><EditPost /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute condition={isLoggedIn} redirectTo="/login"><Profile /></ProtectedRoute>} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/my-collections" element={<MyCollectionPage />} />
        <Route path="/collection" element={<PublicCollectionsPage />} />
        <Route path="/posts/:postId/comments" element={<Comments />} />
        <Route path="/member/:id" element={<ProtectedRoute condition={isLoggedIn} redirectTo="/login"><MemberProfile /></ProtectedRoute>} />
        <Route path="/collection/:memberId" element={<ProtectedRoute condition={isLoggedIn} redirectTo="/login"><MemberCollectionPage /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute condition={isAdmin} redirectTo="/login"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/reviews/:userId" element={<ProtectedRoute condition={isLoggedIn} redirectTo="/login"><ReviewPage /></ProtectedRoute>} />
        <Route path="/chat/:chatId" element={<ProtectedRoute condition={isLoggedIn} redirectTo="/login"><ChatPage /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute condition={isLoggedIn} redirectTo="/login"><MessageDropdown /></ProtectedRoute>} />
        
        {/* ✅ เส้นทางสำหรับ "ลืมรหัสผ่าน" */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
