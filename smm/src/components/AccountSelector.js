import { Axios } from 'axios'
import React, { Component } from 'react'
import ProfileCard from './ProfileCard';

export class AccountSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            accounts: [],
            selectedAccount: ''
        };
        this.handleAccountChange = this.handleAccountChange.bind(this);
    }

    handleAccountChange(event) {
        Axios.get(`https://site222326.tw.cs.unibo.it/profiles/${event.target.value}`)
            .then(res => {
                const currentAccount = res.data;
                this.setState({ selectedAccount: currentAccount });
            })
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
                    <ProfileCard profile={this.state.selectedAccount}/>
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