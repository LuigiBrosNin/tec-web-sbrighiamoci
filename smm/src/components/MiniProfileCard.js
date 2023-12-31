import React, { Component } from 'react'

import "./ProfileCard.css"

export class MiniProfileCard extends Component {

    render() {
        return (
            <div className="card">
                <div className="row no-gutters">
                    <div className="col-4 justify-content-center align-items-center">
                        <img src={this.props.profile.propic} className="card-img profile_img" alt="Profile Picture" />
                    </div>
                    <div className="col-8">
                        <div className="card-body">
                            <h5 className="card-title">
                                {this.props.profile.name}
                            </h5>
                            <p className="card-text">
                                Squeals: {this.props.profile.squeals_num}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default MiniProfileCard