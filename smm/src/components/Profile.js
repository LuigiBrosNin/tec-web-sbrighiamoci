import React from 'react';
import { Link } from 'react-router-dom';
import Squeal from './Squeal';
import ProfileCard from './ProfileCard.js';


import './Profile.css';

class Profile extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      name: "",
      propic: "",
      bio: "",
      credit: [0, 0, 0],
      creditLimits: [0, 0, 0],
      squealsList: [],
      followersList: [],
      followingList: [],
      accountType: "normal",
      extraCredit: 0,
      numberOfSqueals: 0,
      isBanned: false,
      bannedUntil: -1,

      isValid: false,
      showTabContent: false,

      validSquealsList: [],
      allSquealsLoaded: false,
      tmpFollowersList: [],
      allFollowersLoaded: false,
      tmpFollowingList: [],
      allFollowingLoaded: false,
      loadMoreIndex: 0,
      pageDim: 2,  // dimension of a "page" to load
    };

    this.populate = this.populate.bind(this);
    this.fetchProfile = this.fetchProfile.bind(this);
    this.goToSettings = this.goToSettings.bind(this);
    this.fetchMoreSqueals = this.fetchMoreSqueals.bind(this);
    this.fetchFollowers = this.fetchFollowers.bind(this);
    this.loadMoreFollowers = this.loadMoreFollowers.bind(this);
    this.fetchFollowing = this.fetchFollowing.bind(this);
    this.loadMoreFollowing = this.loadMoreFollowing.bind(this);
  }

  async fetchProfile(id) {
    let fetched = await fetch(
      `https://site222326.tw.cs.unibo.it/profiles/${id}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
    fetched = await fetched.json();
    this.populate(fetched);
  }

  populate(profileJson) {
    this.setState({
      name: profileJson.name,
      propic: profileJson.propic,
      bio: profileJson.bio,
      credit: profileJson.credit,
      creditLimits: profileJson.credit_limits,
      squealsList: profileJson.squeals_list,
      followersList: profileJson.followers_list,
      followingList: profileJson.following_list,
      accountType: profileJson.account_type,
      extraCredit: profileJson.extra_credit,
      numberOfSqueals: profileJson.squeals_num,
      isBanned: profileJson.is_banned,
      bannedUntil: profileJson.banned_until,
      isValid: true,
    });
  }

  goToSettings() {
    window.location.href = `https://site222326.tw.cs.unibo.it/app/profile/${this.state.name}/settings`;
  }

  async fetchMoreSqueals() {
    let fetched = await fetch(
      `https://site222326.tw.cs.unibo.it/squeals/?author=${this.state.name}&startindex=${this.state.validSquealsList.length}&endindex=${this.state.validSquealsList.length + this.state.pageDim}`,
      {
        method: "GET",
      }
    );
    if (fetched.status === 200) {
      fetched = await fetched.json();
      if (fetched.length <= 0) {
        this.setState({ allSquealsLoaded: true });
      }
      this.setState(prevState => ({ validSquealsList: prevState.validSquealsList.concat(fetched) }));
    }
  }

  fetchFollowers() {
    this.setState(prevState => ({
      loadMoreIndex: 0,
      tmpFollowersList: prevState.followersList.slice(0, prevState.pageDim)
    }));
  }

  loadMoreFollowers() {
    this.setState(prevState => {
      const newProfiles = prevState.followersList.slice(prevState.loadMoreIndex, prevState.loadMoreIndex + prevState.pageDim);
      return {
        loadMoreIndex: prevState.loadMoreIndex + prevState.pageDim,
        allFollowersLoaded: newProfiles.length === 0,
        tmpFollowersList: [...prevState.tmpFollowersList, ...newProfiles]
      };
    });
  }

  fetchFollowing() {
    this.setState(prevState => ({
      loadMoreIndex: 0,
      tmpFollowingList: prevState.followingList.slice(0, prevState.pageDim)
    }));
  }

  loadMoreFollowing() {
    this.setState(prevState => {
      const newProfiles = prevState.followingList.slice(prevState.loadMoreIndex, prevState.loadMoreIndex + prevState.pageDim);
      return {
        loadMoreIndex: prevState.loadMoreIndex + prevState.pageDim,
        allFollowingLoaded: newProfiles.length === 0,
        tmpFollowingList: [...prevState.tmpFollowingList, ...newProfiles]
      };
    });
  }

  async componentDidMount() {
    if (this.props.id != null) {
      await this.fetchProfile(this.props.id);
      this.fetchMoreSqueals();
    } else if (this.props.selectedAccount != null) {
      console.log("selectedAccount")
      await this.populate(this.props.selectedAccount);
      this.fetchMoreSqueals();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id || prevProps.selectedAccount !== this.props.selectedAccount) {
      this.setState({
        validSquealsList: [],
        allSquealsLoaded: false,
        tmpFollowersList: [],
        allFollowersLoaded: false,
        tmpFollowingList: [],
        allFollowingLoaded: false,
        loadMoreIndex: 0
      });
      this.componentDidMount();
    }
  }

  render() {
    if (!this.props.selectedAccount) {
      return <div>Profile not found</div>;
    }

    return (
      <div className="container profile_container">
        <div className="row profile_main_data">
          <div className="col-sm-4">
            <img className="img-fluid rounded-circle profile_img_container" aria-label="profile-pic" src={(this.state.propic == null || this.state.propic =="https://site222326.tw.cs.unibo.it/images/user-default.svg")  ? "https://site222326.tw.cs.unibo.it/images/user-default.svg" : 'https://' + this.state.propic } />
          </div>
          <div className="col-sm-8">
            <h2 className="profile_name">@{this.state.name}</h2>
            <p className="profile_type">{this.state.accountType}</p>
            <div className="card">
              <div className="card-header">Remaining Credits</div>
              <div className="card-body">
                <div className="row credits_info">
                  <div className="col">
                    <p className="card-text">
                      Daily: {this.state.credit[0]}/{this.state.creditLimits[0]}
                    </p>
                  </div>
                  <div className="col">
                    <p className="card-text">
                      Weekly: {this.state.credit[1]}/{this.state.creditLimits[1]}
                    </p>
                  </div>
                  <div className="col">
                    <p className="card-text">
                      Monthly: {this.state.credit[2]}/{this.state.creditLimits[2]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <p>{this.state.bio}</p>
          </div>
        </div>

        <button className='btn btn-warning' onClick={() => this.setState(prevState => ({ showTabContent: !prevState.showTabContent }))}>
          Toggle Tab Content
        </button>

        {this.state.showTabContent && (
          <div>
            <ul className="nav nav-pills mb-3 flex-column flex-sm-row" id="pills-tab" role="tablist">
              <li className="nav-item flex-sm-fill" role="presentation">
                <button className="nav-link active" id="pills-squeals-tab" data-bs-toggle="pill" data-bs-target="#pills-squeals"
                  type="button" role="tab" aria-controls="pills-squeals" aria-selected="true">
                  Squeals
                </button>
              </li>
              <li className="nav-item flex-sm-fill text-sm-center" role="presentation">
                <button className="nav-link" id="pills-followers-tab" data-bs-toggle="pill" data-bs-target="#pills-followers"
                  type="button" role="tab" aria-controls="pills-followers" aria-selected="false" onClick={this.fetchFollowers}>
                  Followers
                </button>
              </li>
              <li className="nav-item flex-sm-fill text-sm-center" role="presentation">
                <button className="nav-link" id="pills-following-tab" data-bs-toggle="pill" data-bs-target="#pills-following"
                  type="button" role="tab" aria-controls="pills-following" aria-selected="false" onClick={this.fetchFollowing}>
                  Following
                </button>
              </li>
            </ul>
            <div className="tab-content" id="pills-tabContent">
              {/* Squeals Cards */}
              <div className="tab-pane fade show active" id="pills-squeals" role="tabpanel" aria-label="pills-squeals-tab">
                {this.state.squealsList.length > 0 && this.state.validSquealsList.map(sq => <Squeal squeal={sq} selectedAccount={this.props.selectedAccount} />)}
                <div className="loadMoreContainer">
                  {!this.state.allSquealsLoaded && <button onClick={this.fetchMoreSqueals} className="btn btn-primary loadMoreBtn"> Load more</button>}
                  {this.state.allSquealsLoaded && this.state.squealsList.length <= 0 && <div>There are no squeals to show.</div>}
                </div>
              </div>

              {/* Followers Cards */}
              <div className="tab-pane fade" id="pills-followers" role="tabpanel" aria-labelledby="pills-followers-tab">
                {this.state.tmpFollowersList.map(follower => <ProfileCard id={follower} />)}
                <div className="loadMoreContainer">
                  {this.state.tmpFollowersList.length < 1 && <div> No more profiles. </div>}
                  {!this.state.allFollowersLoaded && <button onClick={() => this.loadMoreFollowers} className="btn btn-primary loadMoreBtn"> Load more</button>}
                </div>
              </div>

              {/* Following Cards */}
              <div className="tab-pane fade" id="pills-following" role="tabpanel" aria-labelledby="pills-following-tab">
                {this.state.tmpFollowingList.map(follower => <ProfileCard id={follower} />)}
                <div className="loadMoreContainer">
                  {this.state.tmpFollowingList.length < 1 && <div> No more profiles. </div>}
                  {!this.state.allFollowingLoaded && <button onClick={() => this.loadMoreFollowing} className="btn btn-primary loadMoreBtn"> Load more</button>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Profile;