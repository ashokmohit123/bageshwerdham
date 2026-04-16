import React from 'react'
import { NavLink } from 'react-router-dom'

const TopHeader = () => {
  return (
    <div className="header" id="header">
    <button className="btn btn-light" id="toggleBtn">
      <i className="fa fa-bars"></i>
    </button>
    <div><strong>BHAGESHWER LIVE BACKEND</strong></div>
    <div>
      <div className="dropdown">
        <button className="btn btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
          <i className="fa fa-user"></i> Account
        </button>
        <ul className="dropdown-menu dropdown-menu-end">
          {/* <li><NavLink className="dropdown-item" to="#">Profile</NavLink></li> */}
          <li><NavLink className="dropdown-item" to="/admin/login">Logout</NavLink></li>
        </ul>
      </div>
    </div>
  </div>
  )
}

export default TopHeader
