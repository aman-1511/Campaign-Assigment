import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Campaign Manager
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Campaigns
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/campaign/new" 
              className={`nav-link ${location.pathname === '/campaign/new' ? 'active' : ''}`}
            >
              New Campaign
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/message-generator" 
              className={`nav-link ${location.pathname === '/message-generator' ? 'active' : ''}`}
            >
              Message Generator
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/scraper" 
              className={`nav-link ${location.pathname === '/scraper' ? 'active' : ''}`}
            >
              Lead Scraper
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 