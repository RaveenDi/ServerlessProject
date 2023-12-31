import React, { useState } from "react";
import "../layout.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "aws-amplify/auth";
import { resetUser } from "../redux/userSlice";
import { useDispatch } from "react-redux";



function Layout({ children }) {
  const [collapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  function signOutAll() {
    signOut();
    dispatch(resetUser());
  }

  const userMenu = [
    {
      name: "Home",
      path: "/",
      icon: "ri-home-line",
    },
    {
      name: "Appointments",
      path: "/appointments",
      icon: "ri-file-list-line",
    },
  ];
  return (
    <div className="main">
      <div className="d-flex layout">
        <div className="sidebar">
          <div className="menu">
            {userMenu.map((menu) => {
              const isActive = location.pathname === menu.path;
              return (
                <div
                  className={`d-flex menu-item ${
                    isActive && "active-menu-item"
                  }`}
                >
                  <i className={menu.icon}></i>
                  {!collapsed && <Link to={menu.path}>{menu.name}</Link>}
                </div>
              );
            })}
            <div
              className={`d-flex menu-item `}
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
            >
              <i className="ri-logout-circle-line"></i>
              {!collapsed && (
                <Link to="/login" onClick={signOutAll}>
                  Logout
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="content">
          <div className="body">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
