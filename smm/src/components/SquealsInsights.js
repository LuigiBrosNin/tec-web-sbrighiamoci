import React, { Component } from 'react'
import Squeal from './Squeal'

export class SquealsInsights extends Component {
  constructor(props) {
    super(props);
    this.state = {
      squeals: [],
      startIndex: 0,
      endIndex: 10,
      more_squeals: true
    };
    this.getSqueals = this.getSqueals.bind(this);

  }

  

  componentDidMount() {
    if(this.props.selectedAccount == null){
      return;
    }
    //this.getSqueals();
  }

  getSqueals() {
    const squeals_list = this.props.selectedAccount.squeals_list;

    if (squeals_list == null || squeals_list.length === 0) {
      return;
    }
    console.log("squeals_list: " + squeals_list);
    
    const body = JSON.stringify({ squealList: squeals_list });

    console.log("body: " + body);

    fetch(`https://site222326.tw.cs.unibo.it/squeals_list/?startindex=${this.state.startIndex}&endindex=${this.state.endIndex}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
    },
      body: body,
    })
      .then(response => {
        //check if the response is ok
        if (response.ok) {
          return response.json();
        } else {
          return false
        }})
      .then(data => {
        console.log(data);

        if (!data) {
          this.setState({
            more_squeals: false
          });
          return;
        }

        this.setState(prevState => ({
          squeals: [...prevState.squeals, ...data],
          startIndex: prevState.startIndex + 10,
          endIndex: prevState.endIndex + 10
        }), () => {
          console.log("squeals in state: " + this.state.squeals);
          console.log("Updated start index: " + this.state.startIndex);
          console.log("Updated end index: " + this.state.endIndex);
      });
        console.log("squeals in state: " + this.state.squeals);
      });
  }

  render() {

    return (
      <div>
        {this.state.squeals.map(squeal => (
          <Squeal key={squeal.id} squeal={squeal} selectedAccount={this.props.selectedAccount} />
        ))}
         {this.state.more_squeals ? <button className='btn btn-primary mt-2' onClick={this.getSqueals}>Load More</button> : <p>no more squeals to load for this account.</p>}
      </div>
    );
  }
}

export default SquealsInsights