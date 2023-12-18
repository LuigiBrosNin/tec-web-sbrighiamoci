import React, { Component } from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';

import "./SquealPut.css"

export class SquealPut extends Component {
    constructor(props) {
        super(props);
        this.state = {
          text: "",
          receiver: "",
          propic: null,
          temp_credits: [],
          creditLabels: ["daily", "weekly", "monthly"]
        };
      }
    
      componentDidMount() {
        // retrieve credits
        const profile = this.props.selectedAccount.name;
    
        axios
          .get("https://site222326.tw.cs.unibo.it/profiles/" + profile)
          .then((response) => {
            console.log("response: ", response.data);
            this.setState({
              temp_credits: response.data.credit,
              propic: response.data.propic || "https://site222326.tw.cs.unibo.it/images/user-default.svg"
            });
            console.log("credits: ", this.state.temp_credits);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    
      render() {
        return (
          <div className="squeal_container">
            <form onSubmit={this.submitForm} className="mt-5">
              <div className="input-group mb-3">
                <span className="input-group-text" id="basic-addon1">§</span>
                <input type="text" id="receiver" placeholder="Select a channel to squeal to" value={this.state.receiver} required
                  className="form-control" onChange={e => this.setState({ receiver: e.target.value })} />
              </div>
              <div className="profile_data">
                <img className="profile_img" src={this.state.propic} />
                <Link to={`/profile/${this.props.user}`} className="profile_name">
                  @{this.props.selectedAccount.name}
                </Link>
              </div>
              <div className="form-group">
                <label htmlFor="text">Text:</label>
                <textarea id="text" value={this.state.text} required className="form-control" onChange={e => this.setState({ text: e.target.value })}></textarea>
                <div>
                  <div className="credits-container">
                    {this.state.temp_credits.map((credit, index) => (
                      <span key={index} className={credit > 0 ? "positive" : "negative"}>
                        {this.state.creditLabels[index]}: {credit}&nbsp;&nbsp;
                      </span>
                    ))}
                    {Math.min(...Object.values(this.state.temp_credits)) < 0 && (
                      <button className="btn btn-primary">
                        Buy
                        {Math.abs(Math.min(...Object.values(this.state.temp_credits)))} credits
                        for
                        {(Math.abs(Math.min(...Object.values(this.state.temp_credits))) * 0.01).toFixed(2)}€
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        );
      }
    }
export default SquealPut