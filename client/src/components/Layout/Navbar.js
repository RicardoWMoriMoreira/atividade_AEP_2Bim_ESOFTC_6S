import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          Dev Planner
        </Link>
        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">
            Meus Projetos
          </Link>
          <span className="navbar-user">Olá, {user?.name}</span>
          <button onClick={handleLogout} className="navbar-button">
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

