import React, { Component } from 'react'
//import { Bar } from 'react-chartjs-2';

import Profile from './Profile'

export class ProfileInsights extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: {
        labels: ['Daily', 'Weekly', 'Monthly'],
        datasets: [
          {
            label: 'Credit',
            backgroundColor: 'rgba(255,99,132,0.2)',
            borderColor: 'rgba(255,99,132,1)',
            borderWidth: 2,
            hoverBackgroundColor: 'rgba(255,99,132,0.4)',
            hoverBorderColor: 'rgba(255,99,132,1)',

            data: [0, 0, 0]
          }
        ]
      }
    }
  }

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

        {/*<Bar data={this.state.data} />*/}
      </div>
    )
  }
}

export default ProfileInsights