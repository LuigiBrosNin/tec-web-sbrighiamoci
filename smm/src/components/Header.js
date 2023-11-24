import React, { Component } from 'react'
import './Header.css'

export class Header extends Component {

  render() {
    return (
      <div>
        <header className="bg-success text-white p-3">
          <div className="d-flex align-items-center">
            <img src="https://site222326.tw.cs.unibo.it/images/logoSquealer.svg" alt="Logo" className="mr-2 squealer-logo-header" />
            <h1 className="display-4 fw-bold">SMM Dashboard</h1>
          </div>
        </header>
      </div>
    );
  }
}

export default Header;
