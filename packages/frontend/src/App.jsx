// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, Navigate } from 'react-router-dom';
import Header from './pages/Header/Header';
import Hero from './pages/Hero/Hero';
import About from './pages/About/About';
import Skills from './pages/Skills/Skills';
import Projects from './pages/Projects/Projects';
import Experience from './pages/Experience/Experience';
import Education from './pages/Education/Education';
import Contact from './pages/Contact/Contact';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import MyAccount from './pages/MyAccount/MyAccount';
import { useAuth } from './hooks/useAuth';
import { Button } from './components/ui/button';

const App = () => {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

const MainApp = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Prevent flicker while auth state is loading
  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <>
      <Header />
      <div className="auth-buttons" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 1000 }}>
        {user ? (
          <>
            <Link to="/my-account" style={{ marginRight: '0.5rem' }}>
                <Button variant="outline">My Account</Button>
            </Link>
            <Button onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '0.5rem' }}>
              <Button>Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline">Sign Up</Button>
            </Link>
          </>
        )}
      </div>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/my-account" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/my-account" /> : <Signup />} />
        
        {/* Protected Route for My Account */}
        <Route 
          path="/my-account" 
          element={user ? <MyAccount /> : <Navigate to="/login" />} 
        />
        
        <Route path="/" element={
          <>
            <Hero />
            <About />
            <Skills />
            <Projects />
            <Experience />
            <Education />
            <Contact />
          </>
        } />
      </Routes>
    </>
  );
}

export default App;
