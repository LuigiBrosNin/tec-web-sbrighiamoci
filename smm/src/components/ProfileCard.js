import React, { Component } from 'react'

import "./ProfileCard.css"

export class ProfileCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            propic: "https://site222326.tw.cs.unibo.it/images/user-default.svg"
        };
    }

    render() {
        return (
            <div className="card">
                <div className="row no-gutters">
                    <div className="col-12 justify-content-center align-items-center">
                        <img src={this.state.propic} className="card-img profile_img" alt="Profile Picture" />
                    </div>
                    <div className="col-12">
                        <div className="card-body">
                            <h5 className="card-title">
                                {this.props.profile.name}
                            </h5>
                            <div className="d-flex flex-column">
                                <p className="card-text">
                                    Daily: {this.props.profile.credit[0]}/{this.props.profile.credit_limits[0]}
                                </p>
                                <p className="card-text">
                                    Weekly: {this.props.profile.credit[1]}/{this.props.profile.credit_limits[1]}
                                </p>
                                <p className="card-text">
                                    Monthly: {this.props.profile.credit[2]}/{this.props.profile.credit_limits[2]}
                                </p>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <p className="card-text">
                                        Squeals: {this.props.profile.squeals_num}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ProfileCard