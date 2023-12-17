import React, { Component } from 'react'
import { Link } from 'react-router-dom';

export class Navbar extends Component {
  render() {
    return (
      <div className="sidebar-sticky">
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link className="nav-link active" to="smm/squealPut">New Post</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="smm/profile">Profile Insights</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="smm/squeals">Squeals Insights</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="smm/messages">Messages</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="smm/shop">Shop</Link>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="https://site222326.tw.cs.unibo.it/app/">To App</a>
          </li>
        </ul>
      </div>
    )
  }
}

export default Navbar