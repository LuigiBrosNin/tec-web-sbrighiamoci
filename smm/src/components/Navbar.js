import React, { Component } from 'react'
import { Link } from 'react-router-dom';

export class Navbar extends Component {
  render() {
    return (
      <div className="sidebar-sticky">
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link active" to="/new">New Post</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/profile">Profile Insights</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/squeals">Squeals Insights</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/messages">Messages</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/shop">Shop</Link>
          </li>
        </ul>
      </div>
    )
  }
}

export default Navbar