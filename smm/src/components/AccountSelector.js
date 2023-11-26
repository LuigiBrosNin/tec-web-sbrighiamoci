import { Axios } from 'axios'
import React, { Component } from 'react'

export class AccountSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            accounts: []
        };
    }
  
    getAccounts() {
        Axios.get(`https://site222326.tw.cs.unibo.it/profiles/${this.$user}`)
        .then(res => {
            const accounts = res.data.smm_customers;
            this.setState({ accounts });
        })
    }
  
    render() {
        this.getAccounts();
    return (
      <div>

        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <span>Account</span>
        </h6>
        <select className="form-select" aria-label="Account select">
          <option selected>Choose an account</option>
            {this.state.accounts.map(account => <option value={account}>{account}</option>)}
        </select>
      </div>
    )
  }
}

export default AccountSelector