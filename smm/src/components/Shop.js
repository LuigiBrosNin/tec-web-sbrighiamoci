import React, { Component } from 'react'

import "./Shop.css"

export class Shop extends Component {

  constructor(props) {
    super(props);

    this.makePurchase = this.makePurchase.bind(this);
  }

  componentDidMount() {
    if(this.props.selectedAccount == null){
      return;
    }
  }

  makePurchase(credit, credit_limits) {
    console.log("purchase: ", credit, credit_limits);

    const body = JSON.stringify({ credit: credit, credit_limits: credit_limits });

    fetch(`https://site222326.tw.cs.unibo.it/profiles/${this.props.selectedAccount.name}/shop`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: body
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.message === "Purchase successful") {
          alert("Purchase successful! The page will reload.");
          window.location.reload();
        } else {
          alert("Purchase failed!");
        }
      })
      .catch(err => {
        console.log(err);
        alert("Purchase failed!");
      });
  }

  render() {
    return (
      <div className="container">
        <h1>SMM Exclusive Shop</h1>
        {this.props.selectedAccount ? <p>Buy credits for { this.props.selectedAccount.name }!</p> : null}
        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <img src={process.env.PUBLIC_URL + '/coin1.png'} className="card-img-top my_square-image" alt="Product 1" />
              <div className="card-body">
                <h5 className="card-title">Tears of free speech</h5>
                <p className="card-text">+100 credits, +50 credit limits</p>
                <button className="btn btn-primary" onClick={() => this.makePurchase(100,50)}>Buy for 1.99-</button>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <img src={process.env.PUBLIC_URL + '/coin2.png'} className="card-img-top square-image" alt="Product 2" />
              <div className="card-body">
                <h5 className="card-title">Twitter's lament</h5>
                <p className="card-text">+500 credits, +280 credit limits</p>
                <button className="btn btn-primary" onClick={() => this.makePurchase(500,280)}>Buy for 4.99-</button>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
                <img src={process.env.PUBLIC_URL + '/coin3.png'} className="card-img-top square-image" alt="Product 3" />
                <div className="card-body">
                <h5 className="card-title">That's just my opinion</h5>
                <p className="card-text">+1000 credits, +500 credit limits</p>
                <button className="btn btn-primary" onClick={() => this.makePurchase(1000,500)}>Buy for 9.99-</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Shop