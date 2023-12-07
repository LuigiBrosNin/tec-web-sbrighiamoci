import React, { Component } from 'react'
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link as RouterLink } from 'react-router-dom';

import "./Squeal.css"

export class Squeal extends Component {

  constructor(props) {
    super(props);

    this.hasLocation = this.hasLocation.bind(this);
    this.showMap = this.showMap.bind(this);
  }

  componentDidMount() {
    this.showMap('map' + this.props.squeal.id)
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

    render() {
      return (
        <div className="squeal_container">
          <RouterLink to={"/channel/" + this.props.squeal.receiver}>§{this.props.squeal.receiver}</RouterLink>
          <div>
            <p>Reply to: {this.props.squeal.replyTo}</p>
          </div>

          <div className="profile_data">
            <img className="profile_img" src={this.props.selectedAccount.propic}/>
            <RouterLink to={"smm/profile/" + this.props.squeal.author} className="profile_name"> @{this.props.squeal.author}</RouterLink>
          </div>

          <p className="squeal_body"> {this.props.squeal.text} </p>

          {this.props.squeal.media != null ? <img className="squeal_media" src={this.props.squeal.media} /> : null}

          {this.props.squeal.location != null ?

            <div id="mapcontainer">
              <div id={'map' + this.props.squeal.id} style={{height: 200 +'px'}}></div>
            </div>

            : null}

          <p> {new Date(this.props.squeal.date).toUTCString()} </p>

          <div className="interaction_data">
            <button className="interaction_button">
              <img className="interaction_img" src="https://site222326.tw.cs.unibo.it/icons/face-smile-svgrepo-com.svg" />
              <p>{this.props.squeal.positive_reactions}</p>
            </button>
            <button className="interaction_button">
              <img className="interaction_img" src="https://site222326.tw.cs.unibo.it/icons/face-frown-svgrepo-com.svg" />
              <p>{this.props.squeal.negative_reactions}</p>
            </button>
            <button className="interaction_button">
              <img className="interaction_img"
                src="https://site222326.tw.cs.unibo.it/icons/message-circle-dots-svgrepo-com.svg" />
              <p>{this.props.squeal.replies_num}</p>
            </button>
          </div>

          <RouterLink to={"smm/squeal/" + this.props.squeal.id}>Insights</RouterLink>

        </div>
      )
    }
  }

export default Squeal