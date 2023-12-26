import React, { Component } from 'react'
import MiniProfileCard from './MiniProfileCard'
import './Header.css'

export class Header extends Component {

  componentDidMount() {
    if (this.props.selectedAccount == null) {
      return;
    }

  }

  render() {
    return (
      <div>
        <header className="bg-success text-white p-2">
          <div className="d-flex align-items-center">
            <img src="https://site222326.tw.cs.unibo.it/images/logoSquealer.svg" alt="Logo" className="mr-2 squealer-logo-header margin-element" />
            <h5 className="display-6 fw-bold mr-3 margin-element">SMM Dashboard</h5>
            <div className="ml-3 margin-element">
              {this.props.selectedAccount ? <MiniProfileCard profile={this.props.selectedAccount} /> : null}
            </div>
          </div>
          {this.props.loopObject.is_looping ?
          <div className="alert alert-warning mt-3" role="alert">
            <div className="d-flex justify-content-between">
              <div className="me-3">
                <strong>Posting automatic squeals!</strong>
              </div>
              <div className="mr-3">
                <button className="btn btn-danger" onClick={() => this.props.loopObject.stopLoop()}>Stop</button>
              </div>
            </div>
          </div> : null}
        </header>
      </div>
    );
  }
}

export default Header;
