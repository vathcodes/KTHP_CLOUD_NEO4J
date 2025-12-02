// Sidebar.jsx
import React from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className='sidebar'>
      <div className="sidebar-options">
        <NavLink to='/' className="sidebar-option">
          <img src={assets.dashboard_icon} alt="Dashboard" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to='/add' className="sidebar-option">
          <img src={assets.add_icon} alt="Add Items" />
          <span>Add Items</span>
        </NavLink>
        <NavLink to='/list' className="sidebar-option">
          <img src={assets.order_icon} alt="List Items" />
          <span>List Items</span>
        </NavLink>
        <NavLink to='/orders' className="sidebar-option">
          <img src={assets.order_icon} alt="Orders" />
          <span>Orders</span>
        </NavLink>
        <NavLink to='/users' className="sidebar-option">
          <img src={assets.user_icon} alt="Manage Users" />
          <span>Users</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
