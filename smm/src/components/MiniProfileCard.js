import React, { Component } from 'react'

import "./ProfileCard.css"

export class MiniProfileCard extends Component {

    render() {
        return (
            <div className="card" role="presentation">
                <div className="row no-gutters">
                    <div className="col-4 justify-content-center align-items-center">
                        <img src={this.props.profile.propic == null ? "https://site222326.tw.cs.unibo.it/images/user-default.svg" : 'https://' + this.props.profile.propic } className="card-img profile_img" alt="Profile Picture" />
                    </div>
                    <div className="col-8">
                        <div className="card-body">
                            <h5 className="card-title">
                                <span aria-label="Profile Name">{this.props.profile.name}</span>
                            </h5>
                            <p className="card-text">
                                <span aria-label="Number of Squeals">Squeals: {this.props.profile.squeals_num}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default MiniProfileCard