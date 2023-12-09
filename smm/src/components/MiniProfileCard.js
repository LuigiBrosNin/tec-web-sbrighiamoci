import React, { Component } from 'react'

import "./ProfileCard.css"

export class MiniProfileCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            propic: "https://site222326.tw.cs.unibo.it/images/user-default.svg"
        };
    }

    componentDidMount() {
        let propic = "https://site222326.tw.cs.unibo.it/images/user-default.svg"

        if (this.props.profile.propic != null) {
            propic = "https://site222326.tw.cs.unibo.it/profiles/" + this.props.profile.name + "/propic";
        }
        this.setState({ propic: propic });
    }

    render() {
        return (
            <div className="card">
                <div className="row no-gutters">
                    <div className="col-4 justify-content-center align-items-center">
                        <img src={this.state.propic} className="card-img profile_img" alt="Profile Picture" />
                    </div>
                    <div className="col-8">
                        <div className="card-body">
                            <h5 className="card-title">
                                {this.props.profile.name}
                            </h5>
                            <p className="card-text">
                                Squeals: {this.props.profile.squeals_list.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default MiniProfileCard