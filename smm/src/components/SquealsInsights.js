import React, { Component } from 'react'
import Squeal from './Squeal'

export class SquealsInsights extends Component {
  constructor(props) {
    super(props);
    this.state = {
      squeals: [],
      startIndex: 0,
      endIndex: 10
    };
    this.getSqueals = this.getSqueals.bind(this);

  }

  

  componentDidMount() {
    this.getSqueals();
  }

  getSqueals() {
    const squeals_list = this.props.selectedAccount.squeals_list; // Use optional chaining to handle undefined value

    if (squeals_list == null || squeals_list.length === 0) {
      return;
    }
    console.log("squeals_list: " + squeals_list);

    fetch(`https://site222326.tw.cs.unibo.it/squeals_list?startindex${this.state.startIndex}&endindex=${this.state.endIndex}`, {
      method: "POST",
      body: JSON.stringify({ squealList: squeals_list })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        this.setState(prevState => ({
          squeals: [...prevState.squeals, ...data]
        }));
        this.startindex += 10;
        this.endIndex += 10;
      });
  }

  render() {

    return (
      <div>
        {this.state.squeals.map(squeal => (
          <Squeal key={squeal.id} squeal={squeal} />
        ))}
        <button onClick={this.getSqueals}>Load More</button>
      </div>
    );
  }
}

export default SquealsInsights