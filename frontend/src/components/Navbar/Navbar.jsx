import React, { useContext, useState, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount, token, setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate("/");
    setMenu("home");
  };

  // Tự động highlight menu dựa vào pathname
  useEffect(() => {
    if (location.pathname === "/") setMenu("home");
    else if (location.pathname === "/contact") setMenu("contact");
    else if (location.pathname === "/app") setMenu("mobile-app");
    else if (location.pathname === "/menu") setMenu("menu");
  }, [location.pathname]);

  return (
    <div className='navbar'>
      <Link to='/' onClick={() => setMenu("home")}>
        <img src={assets.logo} alt="logo" className='logo' />
      </Link>

      <ul className='navbar-menu'>
        <Link
          to='/'
          onClick={() => setMenu("home")}
          className={menu === "home" ? "active" : ""}
        >
          Home
        </Link>

        {/* Menu page */}
        <Link
          to='/menu'
          onClick={() => setMenu("menu")}
          className={menu === "menu" ? "active" : ""}
        >
          Menu
        </Link>

        {/* Mobile-App route */}
        <Link
          to='/app'
          onClick={() => setMenu("mobile-app")}
          className={menu === "mobile-app" ? "active" : ""}
        >
          Mobile-App
        </Link>

        {/* Contact */}
        <Link
          to='/contact'
          onClick={() => setMenu("contact")}
          className={menu === "contact" ? "active" : ""}
        >
          Contact Us
        </Link>
      </ul>

      <div className="navbar-right">
        <div className="navbar-search-icon">
          <Link to='/cart'>
            <img src={assets.basket_icon} alt="" />
          </Link>
          <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
        </div>

        {!token ? (
          <button onClick={() => setShowLogin(true)}>Sign in</button>
        ) : (
          <div className='navbar-profile'>
            <img src={assets.profile_icon} alt="" />
            <ul className="nav-profile-dropdown">
              <li onClick={() => navigate('/myorders')}>
                <img src={assets.bag_icon} alt="" />
                <p>Orders</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="" />
                <p>Logout</p>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
