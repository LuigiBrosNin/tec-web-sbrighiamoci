import React, { Component } from 'react'
import axios from 'axios';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";


import "./SquealPut.css"

export class SquealPut extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      receiver: "",
      reply_to: "",
      propic: null,
      credits: [0, 0, 0],
      temp_credits: [],
      creditLabels: ["daily", "weekly", "monthly"],
      media: null,
      charCount: 0,
      media_value: 0,
      map_value: 0,
      location: null,
      map: null,
      marker: null,
      mediaUrl: null,
    };

    this.updateCreditsOnScreen = this.updateCreditsOnScreen.bind(this);
    this.getGeolocation = this.getGeolocation.bind(this);
    this.showMap = this.showMap.bind(this);
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.removeLocation = this.removeLocation.bind(this);
    this.removeMedia = this.removeMedia.bind(this);

  }

  removeLocation = () => {
    this.setState({ location: null });
  };

  removeMedia = () => {
    this.setState({ media: null, mediaUrl: null });
  };


  updateCreditsOnScreen = (newText) => {
    if (newText != null) {
      this.setState({ charCount: newText.length }); // Update charCount when text changes
      this.state.charCount = newText.length;
    }
    let temp_credits = JSON.parse(JSON.stringify(this.state.credits)); // Create a deep copy of credits
    for (let field in temp_credits) {
      temp_credits[field] -= this.state.charCount + this.state.media_value + this.state.map_value;
    }
    this.setState({ temp_credits });
  };

  getGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        this.setState({ location });

        //move the marker to the new location
        this.state.map.panTo(new L.LatLng(location.latitude, location.longitude));
        this.state.map.setZoom(13);
        this.state.marker.setLatLng(new L.LatLng(location.latitude, location.longitude));

      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  showMap = (location) => {
    const map = L.map("map").setView(
      [location.latitude, location.longitude],
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
    const marker = L.marker([location.latitude, location.longitude], {
      icon: customIcon,
      draggable: true,
      autoPan: true,
    }).addTo(map);

    // Update the location in the state when the marker is dragged
    marker.on('dragend', (event) => {
      const position = marker.getLatLng();
      this.setState({ location: { latitude: position.lat, longitude: position.lng } });
    });

    this.setState({ map, marker });
  };

  handleFileUpload = (event) => {
    console.log("file uploaded");
    const file = event.target.files[0];
    const fileUrl = URL.createObjectURL(file);
    this.setState({ media: file, mediaUrl: fileUrl });
  };

  submitForm = () => {

    if (Math.min(...Object.values(this.state.temp_credits)) < 0) {
      axios.put("https://site222326.tw.cs.unibo.it/profiles/" + this.props.selectedAccount.name + "/shop", {
        credit: [
          this.state.temp_credits[0] < 0 ? Math.abs(this.state.temp_credits[0]) : 0,
          this.state.temp_credits[1] < 0 ? Math.abs(this.state.temp_credits[1]) : 0,
          this.state.temp_credits[2] < 0 ? Math.abs(this.state.temp_credits[2]) : 0,
        ],
        credit_limits: [0, 0, 0],
      }).then((response) => {
        console.log(response.data);
        if (response.status === 200) {
          const jsonBody = {
            author: this.props.selectedAccount.name,
            text: this.state.text,
            receiver: this.state.receiver,
            reply_to: this.state.reply_to,
            is_private: false,
            location: this.state.location,
          };
          const formData = new FormData();
          formData.append("json", JSON.stringify(jsonBody));
          formData.append("file", this.state.media);

          console.log("sending body: ", formData);
          // Send formData to server using axios or fetch
          axios
            .put("https://site222326.tw.cs.unibo.it/squeals/", formData)
            .then((response) => {
              console.log(response.data);
              if (response.status === 200) {
                const id = response.data.squeal_id;
                this.props.history.push(`/squeal/${id}`);

              } else {
                alert("an error has occurred, please try again later");
              }
            })
            .catch((error) => {
              console.log(error);
              alert("an error has occurred, please try again later");
            });
        } else {
          alert("an error has occurred, please try again later");
        }
      })
    } else {
      const jsonBody = {
        author: this.props.selectedAccount.name,
        text: this.state.text,
        receiver: this.state.receiver,
        reply_to: this.state.reply_to,
        is_private: false,
        location: this.state.location,
      };
      const formData = new FormData();
      formData.append("json", JSON.stringify(jsonBody));
      formData.append("file", this.state.media);

      console.log("sending body: ", formData);
      // Send formData to server using axios or fetch
      axios
        .put("https://site222326.tw.cs.unibo.it/squeals/", formData)
        .then((response) => {
          console.log(response.data);
          if (response.status === 200) {
            const id = response.data.squeal_id;
            this.props.history.push(`/squeal/${id}`);

          } else {
            alert("an error has occurred, please try again later");
          }
        })
        .catch((error) => {
          console.log(error);
          alert("an error has occurred, please try again later");
        });
    }
  };

  componentDidMount() {

    if (this.props.selectedAccount == null) {
      return;
    }

    // retrieve credits
    const profile = this.props.selectedAccount.name;

    axios
      .get("https://site222326.tw.cs.unibo.it/profiles/" + profile)
      .then((response) => {
        console.log("response: ", response.data);
        this.setState({
          temp_credits: response.data.credit,
          credits: response.data.credit,
          propic: response.data.propic || "https://site222326.tw.cs.unibo.it/images/user-default.svg",
          receiver: this.props.receiver ? this.props.receiver : "",
          reply_to: this.props.replyto ? this.props.replyto : "",
        });
      })
      .catch((error) => {
        console.log(error);
      });

    this.showMap({ latitude: 0, longitude: 0 });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.selectedAccount == null || prevProps.selectedAccount.name !== this.props.selectedAccount.name) {
      this.componentDidMount();
    }

    // Watch for changes in text
    if (prevState.text !== this.state.text) {
      console.log("text changed: ", this.state.text);
      this.updateCreditsOnScreen(this.state.text);
    }

    // Watch for changes in media
    if (prevState.media !== this.state.media) {
      console.log("media changed: ", this.state.media);
      if (this.state.media) {
        this.setState({ media_value: 125 }, () => {
          console.log("media value: ", this.state.media_value);
          this.updateCreditsOnScreen(null);
        });
      } else {
        this.setState({ media_value: 0 }, () => {
          console.log("media value: ", this.state.media_value);
          this.updateCreditsOnScreen(null);
        });
      }
    }

    // Watch for changes in location
    if (prevState.location !== this.state.location) {
      console.log("location changed: ", this.state.location);
      if (this.state.location) {
        this.setState({ map_value: 125 }, () => {
          console.log("map value: ", this.state.map_value);
          this.updateCreditsOnScreen(null);
        });
      } else {
        this.setState({ map_value: 0 }, () => {
          console.log("map value: ", this.state.map_value);
          this.updateCreditsOnScreen(null);
        });
      }

    }
  }

  render() {
    return (
      this.props.selectedAccount == null ? null :
        <div className="squeal_container">
          <form onSubmit={(e) => { e.preventDefault(); this.submitForm(); }} className="mt-5">
            <div className="input-group mb-3">
              <span className="input-group-text" id="basic-addon1">§</span>
              <input type="text" id="receiver" placeholder="Select a channel to squeal to" value={this.state.receiver} required
                className="form-control" onChange={e => this.setState({ receiver: e.target.value })} />
            </div>
            <div className="profile_data">
              <img className="profile_img" src={this.state.propic} alt='propic' />
              <Link to={`/profile/${this.props.user}`} className="profile_name">
                @{this.props.selectedAccount.name}
              </Link>
            </div>
            <div className="form-group">
              <label htmlFor="text">Text:</label>
              <textarea id="text" value={this.state.text} required className="form-control" onChange={e => { this.setState({ text: e.target.value }); this.state.text = e.target.value; this.updateCreditsOnScreen(this.state.text) }}></textarea>
              <div>
                <div className="credits-container">
                  {this.state.temp_credits.map((credit, index) => (
                    <span key={index} className={credit > 0 ? "positive" : "negative"}>
                      {this.state.creditLabels[index]}: {credit}&nbsp;&nbsp;
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col">
                <div className="form-group">
                  <label htmlFor="location" className="form-label">Location:</label>
                  <button onClick={(e) => { e.preventDefault(); this.getGeolocation() }} className="btn btn-info">
                    Set current location
                  </button>
                  {this.state.location && (
                    <button onClick={(e) => { e.preventDefault(); this.removeLocation() }} className="btn btn-warning">
                      X
                    </button>
                  )}
                  <p>
                    {this.state.location
                      ? `Latitude: ${this.state.location.latitude}, Longitude: ${this.state.location.longitude}`
                      : "No Location will be sent"}
                  </p>
                  <div id="map" style={{ height: "200px" /*this.state.location ? "200px" : "0px"*/ }}></div>
                </div>
              </div>

              <div className="col">
                <div className="form-group">
                  <label htmlFor="media" className="form-label">Media:</label>
                  <input type="file" id="media" onChange={this.handleFileUpload} accept="image/*" className="form-control" />
                  {this.state.media && (
                    <button onClick={(e) => { e.preventDefault(); this.removeMedia() }} className="btn btn-danger">
                      X
                    </button>
                  )}
                </div>
                {this.state.media && (
                  <div>
                    <p>Uploaded file:</p>
                    {this.state.mediaUrl && (
                      <img src={this.state.mediaUrl} alt="uploaded file" style={{ maxWidth: "30vw", maxHeight: "30vh" }} />
                    )}
                  </div>
                )}
                {!this.state.media && <p>No file selected</p>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reply_to">Reply To:</label>
              <input type="text" id="reply_to" value={this.state.reply_to} onChange={e => this.setState({ reply_to: e.target.value })} className="form-control" />
            </div>
            {Math.min(...Object.values(this.state.temp_credits)) < 0 ? (
              <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#ff8900", color: "white" }} onClick={(e) => { e.preventDefault() }}>
                Buy {Math.abs(Math.min(...Object.values(this.state.temp_credits)))} credits
                for {(Math.abs(Math.min(...Object.values(this.state.temp_credits))) * 0.01).toFixed(2)}€
                and submit
              </button>
            ) :
              (<button type="submit" className="btn btn-primary" style={{ backgroundColor: "#ff8900", color: "white" }}>
                Submit
              </button>)
            }
          </form>
        </div>
    );
  }
}
export default SquealPut