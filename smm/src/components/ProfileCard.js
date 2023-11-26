import React, { Component } from 'react'

import "ProfileCard.css"

export class ProfileCard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            profile: props.profile
        };
    }

    render() {
        return (
            <div class="row no-gutters">
                <div class="col-md-4 d-flex justify-content-center align-items-center">
                    <img src="profilePicUrl" class="card-img profile_img" alt="Profile Picture" />
                </div>
                <div class="col-md-8">
                    <div class="card-body">
                        <h5 class="card-title">
                            { this.props.profile.name }
                        </h5>
                        <p class="card-text">{ this.props.profile.bio }</p>
                        <div class="row credits_info">
                            <div class="col">
                                <p class="card-text">
                                    Daily: { this.props.profile.credit[0] }/{ this.props.profile.creditLimits[0] }
                                </p>
                            </div>
                            <div class="col">
                                <p class="card-text">
                                    Weekly: { this.props.profile.credit[1] }/{ this.props.profile.creditLimits[1] }
                                </p>
                            </div>
                            <div class="col">
                                <p class="card-text">
                                    Monthly: { this.props.profile.credit[2] }/{ this.props.profile.creditLimits[2] }
                                </p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <p class="card-text">
                                    Squeals: { this.props.profile.numberOfSqueals }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ProfileCard