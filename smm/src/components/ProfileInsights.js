import React, { Component } from 'react'
//import { Bar } from 'react-chartjs-2';

import Profile from './Profile'
import ProfileInsightFunctional from './ProfileInsightFunctional'

export class ProfileInsights extends Component {

  render() {
    if (!this.props.selectedAccount) {
      return (
        <div>
          <p>No selected account</p>
        </div>
      )
    }
    return (
      <div>
        <Profile selectedAccount={this.props.selectedAccount} />

        <ProfileInsightFunctional selectedAccount={this.props.selectedAccount} />
      </div>
    )
  }
}

export default ProfileInsights