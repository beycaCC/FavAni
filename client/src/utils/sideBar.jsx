import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, toggle }) => {
  return (
    <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
      <ul>
        <li><Link to="/">Home</Link></li>
        <hr/>
        <li><Link to="/userDashboard">User Dashboard</Link></li>
        {/* Add other pages here */}
      </ul>
    </nav>
  );
};

export default Sidebar;
