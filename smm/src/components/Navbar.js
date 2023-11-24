import React, { Component } from 'react'

export class Navbar extends Component {
  render() {
    return (
        <div className="sidebar-sticky">
        <ul className="nav flex-column">
          <li className="nav-item">
            <a className="nav-link active" href="#">Home</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">Link 1</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#">Link 2</a>
          </li>
        </ul>
      </div>
    )
  }
}

export default Navbar