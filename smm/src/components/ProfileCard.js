import React, { Component } from 'react'

import "./ProfileCard.css"

export class ProfileCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            profile: props.profile
        };
    }

    render() {
        let propic = "https://site222326.tw.cs.unibo.it/images/user-default.svg"

        if (this.props.profile.propic != null) {
            propic = "https://site222326.tw.cs.unibo.it/profiles/" + this.props.profile.name + "/propic";
        }

        return (
            <div className="card">
                <div className="row no-gutters">
                    <div className="col-12 justify-content-center align-items-center">
                        <img src={propic} className="card-img profile_img" alt="Profile Picture" />
                    </div>
                    <div className="col-12">
                        <div className="card-body">
                            <h5 className="card-title">
                                Current: {this.props.profile.name}
                            </h5>
                            <p className="card-text">Bio: {this.props.profile.bio}</p>
                            <div className="d-flex flex-column">
                                <p className="card-text">
                                    Daily: {this.props.profile.credit[0]}/{this.props.profile.creditLimits[0]}
                                </p>
                                <p className="card-text">
                                    Weekly: {this.props.profile.credit[1]}/{this.props.profile.creditLimits[1]}
                                </p>
                                <p className="card-text">
                                    Monthly: {this.props.profile.credit[2]}/{this.props.profile.creditLimits[2]}
                                </p>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <p className="card-text">
                                        Squeals: {this.props.profile.numberOfSqueals}
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