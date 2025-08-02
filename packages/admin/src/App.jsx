import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PortfolioList from './pages/portfolio/PortfolioList';
import PortfolioForm from './pages/portfolio/PortfolioForm';
import CategoryManager from './pages/portfolio/CategoryManager';
import Inbox from './pages/Inbox';
import OrderList from './pages/orders/OrderList';
import OrderForm from './pages/orders/OrderForm';
import OrderDetail from './pages/orders/OrderDetail';
import BlogList from './pages/blog/BlogList';
import BlogForm from './pages/blog/BlogForm';
import BlogCategoryManager from './pages/blog/BlogCategoryManager';
import BlogTagManager from './pages/blog/BlogTagManager';
import UserList from './pages/users/UserList';
import UserInvitation from './pages/users/UserInvitation';
import UserForm from './pages/users/UserForm';
import MediaManager from './pages/MediaManager';
import Settings from './pages/Settings';
import PermissionManager from './pages/permissions/PermissionManager';
import MyProfile from './pages/MyProfile';
import EducationList from './pages/education/EducationList';
import EducationForm from './pages/education/EducationForm';
import ExperienceList from './pages/experience/ExperienceList';
import ExperienceForm from './pages/experience/ExperienceForm';
import ClientDashboard from './pages/client/ClientDashboard';


// Placeholder pages
const NotFound = () => <h1 className="text-3xl font-bold">404 - Not Found</h1>;


function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect base URL to admin dashboard */}
        <Route path="/" element={<Navigate to="/admin" />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Admin Panel routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            
            {/* Orders Routes */}
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/new" element={<OrderForm />} />
            <Route path="orders/edit/:id" element={<OrderForm />} />
            <Route path="orders/:id" element={<OrderDetail />} />

            <Route path="inbox" element={<Inbox />} />
            <Route path="media" element={<MediaManager />} />
            
            <Route path="portfolio" element={<PortfolioList />} />
            <Route path="portfolio/new" element={<PortfolioForm />} />
            <Route path="portfolio/edit/:id" element={<PortfolioForm />} />
            <Route path="portfolio/categories" element={<CategoryManager />} /> 
            
            {/* Blog Routes */}
            <Route path="blog" element={<BlogList />} />
            <Route path="blog/new" element={<BlogForm />} />
            <Route path="blog/edit/:id"={<BlogForm />} />
            <Route path="blog/categories" element={<BlogCategoryManager />} />
            <Route path="blog/tags" element={<BlogTagManager />} />

            {/* Users Routes */}
            <Route path="users" element={<UserList />} />
            <Route path="users/new" element={<UserInvitation />} />
            <Route path="users/edit/:id" element={<UserForm />} />
            
            {/* Education Routes */}
            <Route path="education" element={<EducationList />} />
            <Route path="education/new" element={<EducationForm />} />
            <Route path="education/edit/:id" element={<EducationForm />} />

            {/* Experience Routes */}
            <Route path="experience" element={<ExperienceList />} />
            <Route path="experience/new" element={<ExperienceForm />} />
            <Route path="experience/edit/:id" element={<ExperienceForm />} />
            
            {/* Client Dashboard Route */}
            <Route path="my-account" element={<ClientDashboard />} />

            {/* Settings & Permissions */}
            <Route path="settings" element={<Settings />} />
            <Route path="permissions" element={<PermissionManager />} />

            <Route path="profile" element={<MyProfile />} />
          </Route>
        </Route>

        {/* Catch-all route for not found pages */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
