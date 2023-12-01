import React, { Component } from 'react'

export class ProfileInsights extends Component {

  render() {
    return (
      <div>
        {this.props.selectedAccount ? <p>{this.props.selectedAccount.name}</p> : <p>Profile Insights</p>}
      </div>
    )
  }
}

export default ProfileInsights