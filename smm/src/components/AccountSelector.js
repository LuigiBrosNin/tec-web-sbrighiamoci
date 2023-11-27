import React, { Component } from 'react'
import axios from 'axios';
import ProfileCard from './ProfileCard';

import { $user, $selectedAccount } from '../App';

export class AccountSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      smm_account: {
        name: "",
        bio: "",
        credit: [],
        creditLimits: [],
        numberOfSqueals: 0,
        profilePicUrl: ""
      },
      accounts: [],
      selectedAccount: {
        name: "",
        bio: "",
        credit: [],
        creditLimits: [],
        numberOfSqueals: 0,
        profilePicUrl: ""
      }
    };
    this.handleAccountChange = this.handleAccountChange.bind(this);
    this.getAccounts = this.getAccounts.bind(this);
  }

  handleAccountChange(event) {
    if (event.target.value === '') {
      this.setState({ selectedAccount: this.smm_account });
      return;
    }

    axios.get(`https://site222326.tw.cs.unibo.it/profiles/${event.target.value}`)
      .then(res => {
        const currentAccount = res.data;
        if (currentAccount.propic == null) {
          currentAccount.profilePicUrl = "https://site222326.tw.cs.unibo.it/images/user-default.svg";
        } else {
          currentAccount.profilePicUrl = "https://site222326.tw.cs.unibo.it/profiles/" + currentAccount.name + "/propic";
        }
        $selectedAccount = currentAccount;
        this.setState({ selectedAccount: currentAccount });
      })
  }


  getAccounts() {
    axios.get(`https://site222326.tw.cs.unibo.it/profiles/${$user}`)
      .then(res => {
        const accounts = res.data.smm_customers;
        const smm_account = res.data;
        if (smm_account.propic == null) {
          smm_account.propic = "https://site222326.tw.cs.unibo.it/images/user-default.svg";
        } else {
          smm_account.profilePicUrl = "https://site222326.tw.cs.unibo.it/profiles/" + smm_account.name + "/propic";
        }
        this.setState({ accounts: accounts, smm_account: smm_account, selectedAccount: smm_account });
      })
  }

  render() {
    this.getAccounts();
    return (
      <div>

        <h6 className="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
          <ProfileCard profile={this.state.selectedAccount} />
        </h6>
        <select className="form-select" aria-label="Default select example" value={this.state.selectedAccount} onChange={this.handleAccountChange}>
          <option value="">Choose an account</option>
          {this.state.accounts.map(account => <option key={account} value={account}>{account}</option>)}
        </select>
      </div>
    )
  }
}

export default AccountSelector