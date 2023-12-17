import React, { Component } from 'react'
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link as RouterLink } from 'react-router-dom';

import "./Squeal.css"

export class Squeal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: this.props.selectedAccount.name,
      squeal: this.props.squeal,
      isValid: true,

      canBeDeleted: false
    };

    this.hasLocation = this.hasLocation.bind(this);
    this.showMap = this.showMap.bind(this);
    this.registerImpression = this.registerImpression.bind(this);
    this.addOrRemovePositiveReaction = this.addOrRemovePositiveReaction.bind(this);
    this.addOrRemoveNegativeReaction = this.addOrRemoveNegativeReaction.bind(this);
    this.canUserDeleteIt = this.canUserDeleteIt.bind(this);
    this.askToDelete = this.askToDelete.bind(this);
    this.deleteSqueal = this.deleteSqueal.bind(this);
  }

  componentDidMount() {
    if (this.props.selectedAccount == null || this.props.squeal == null) {
      return;
    }

    this.showMap('map' + this.state.squeal.id)

    this.canUserDeleteIt();

    this.registerImpression();
  }

  hasLocation() {
    return (this.props.squeal.location != null && this.props.squeal.location != "" && !(JSON.stringify(this.props.squeal.location) === "{}"));
  }

  showMap(divName) {
    if (this.hasLocation()) {
      const map = L.map(divName).setView(
        [this.props.squeal.location.latitude, this.props.squeal.location.longitude],
        13
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);
      // Create a new icon
      const customIcon = L.icon({
        iconUrl: "https://site222326.tw.cs.unibo.it/icons/squealer_marker.png",
        iconSize: [38, 38], // size of the icon
        iconAnchor: [19, 38], // point of the icon which will correspond to marker's location
        popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
      });
      L.marker([this.props.squeal.location.latitude, this.props.squeal.location.longitude], {
        icon: customIcon,
      }).addTo(map);
      return map;
    }
  }

  async registerImpression() {
    await fetch(
      `https://site222326.tw.cs.unibo.it/squeals/${this.props.squeal.id}/impressions`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
  async addOrRemovePositiveReaction() {
    if (this.state.user != null) {
      await fetch(
        `https://site222326.tw.cs.unibo.it/squeals/${this.props.squeal.id}/positive_reactions_list`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      let positiveUsers = await fetch(
        `https://site222326.tw.cs.unibo.it/squeals/${this.props.squeal.id}/positive_reactions_list`,
        {
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      const pos = await positiveUsers.json();

      this.setState({
        squeal: {
          ...this.state.squeal,
          positive_reactions_list: pos,
          positive_reactions: pos.length
        }
      });

    }
    else {
      window.location.replace("https://site222326.tw.cs.unibo.it/login");
    }
  }
  async addOrRemoveNegativeReaction() {
    if (this.state.user != null) {
      await fetch(
        `https://site222326.tw.cs.unibo.it/squeals/${this.state.squeal.id}/negative_reactions_list`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      let negativeUsers = await fetch(
        `https://site222326.tw.cs.unibo.it/squeals/${this.state.squeal.id}/negative_reactions_list`,
        {
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      const neg = await negativeUsers.json();

      this.setState({
        squeal: {
          ...this.state.squeal,
          negative_reactions_list: neg,
          negative_reactions: neg.length
        }
      });

    }
    else {
      window.location.replace("https://site222326.tw.cs.unibo.it/login");
    }
  }
  async canUserDeleteIt() {
    let channel = await fetch(
      `https://site222326.tw.cs.unibo.it/channels/${this.state.squeal.receiver}`,
      {
        method: "GET",
      }
    );
    if (channel.status == 200) {
      channel = await channel.json();
      
      const canBeDeleted = (this.state.user != null) && (this.state.user == this.state.squeal.author || this.state.user == channel.owner || channel.mod_list.includes(this.state.user));
      this.setState({
        canBeDeleted: canBeDeleted
      });
    } else {
      this.setState({
        canBeDeleted: false
      });
    }

  }
  askToDelete() {
    if (window.confirm("Are you sure you want to delete this squeal? This action can't be undone") == true) {
      this.deleteSqueal();
    } else {
      // do nothing
    }

  }
  async deleteSqueal() {
    let res = await fetch(
      `https://site222326.tw.cs.unibo.it/squeals/${this.state.squeal.id}`,
      {
        method: "DELETE",
      }
    );
    if (res.status == 200) {
      this.setState({
        isValid: false
      });
    }
  }

  render() {
    return (
        this.state.isValid && !this.state.squeal.is_private ?

      <div className="squeal_container">
        <RouterLink to={"https://site222326.tw.cs.unibo.it/app/channel/" + this.props.squeal.receiver}>§{this.props.squeal.receiver}</RouterLink>
        <div>
          <p>Reply to: {this.props.squeal.replyTo}</p>
        </div>

        <div className="profile_data">
          <img className="profile_img" src={this.props.selectedAccount.propic} />
          <RouterLink to={"smm/profile/" + this.props.squeal.author} className="profile_name"> @{this.props.squeal.author}</RouterLink>
        </div>

        <p className="squeal_body"> {this.props.squeal.text} </p>

        {this.props.squeal.media != null && this.props.squeal.media != "" ? <img className="squeal_media" src={this.props.squeal.media} /> : null}

        {this.hasLocation() ?

          <div id="mapcontainer">
            <div id={'map' + this.props.squeal.id} style={{ height: 200 + 'px' }}></div>
          </div>

          : null}

        <p> {new Date(this.props.squeal.date).toUTCString()} </p>

        <div className="interaction_data">
          <button
            className={`interaction_button ${this.props.user && this.props.squeal.positive_reactions_list.includes(this.props.user) ? 'active_button' : ''}`}
            onClick={this.addOrRemovePositiveReaction}
          >
            <img className="interaction_img" src="https://site222326.tw.cs.unibo.it/icons/face-smile-svgrepo-com.svg" />
            <p className="interaction_counter">{this.props.squeal.positive_reactions}</p>
          </button>
          <button
            className={`interaction_button ${this.props.user && this.props.squeal.negative_reactions_list.includes(this.props.user) ? 'active_button' : ''}`}
            onClick={this.addOrRemoveNegativeReaction}
          >
            <img className="interaction_img" src="https://site222326.tw.cs.unibo.it/icons/face-frown-svgrepo-com.svg" />
            <p className="interaction_counter">{this.props.squeal.negative_reactions}</p>
          </button>
          <RouterLink className="interaction_button" to={`/smm/squealPut?replyto=${this.props.squeal.id}&receiver=${this.props.squeal.receiver}`}>
            <img className="interaction_img" src="https://site222326.tw.cs.unibo.it/icons/message-circle-dots-svgrepo-com.svg" />
            <p className="interaction_counter">{this.props.squeal.replies}</p>
          </RouterLink>
        </div>

        <RouterLink to={this.props.squeal.id}>Insights</RouterLink>


        {this.state.canBeDeleted ?

          <button className="delete_btn" onClick={this.askToDelete}>
            <img className="delete_img" src="https://site222326.tw.cs.unibo.it/icons/trash-svgrepo-com.svg" />
          </button>

          : null}

      </div> 
      
      : null
    )
  }
}

export default Squeal