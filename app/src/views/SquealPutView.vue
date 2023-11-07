<template>
  <div class="container">
    <form @submit.prevent="submitForm" class="mt-5">
      <div class="form-group">
        <label for="author">Author:</label>
        <!-- TODO remove author field and use $user in scripts -->
        <input
          type="text"
          id="author"
          v-model="author"
          required
          class="form-control"
        />
      </div>
      <div class="form-group">
        <div>
          <p>Credits:</p>
          <div>
            <span v-for="credit in temp_credits" :key="credit.id">
              {{ credit }}&nbsp;&nbsp;
            </span>
            <span v-if="Math.min(...Object.values(temp_credits)) < 0">
              <button class="btn btn-primary">
                Buy
                {{ Math.abs(Math.min(...Object.values(temp_credits))) }} credits
                for
                {{
                  (
                    Math.abs(Math.min(...Object.values(temp_credits))) * 0.01
                  ).toFixed(2)
                }}€
              </button>
            </span>
          </div>
        </div>
        <label for="text">Text:</label>
        <textarea
          id="text"
          v-model="text"
          required
          class="form-control"
        ></textarea>
      </div>
      <div class="form-group">
        <label for="receiver">Receiver:</label>
        <input
          type="text"
          id="receiver"
          v-model="receiver"
          required
          class="form-control"
        />
      </div>
      <div class="row">
        <div class="col">
          <div class="form-group">
            <button @click="getGeolocation" class="btn btn-info">
              Include Geolocation in your Squeal
            </button>
            <button
              v-if="location"
              @click="
                {
                  location = null;
                }
              "
              class="btn btn-warning"
            >
              X
            </button>
            <p v-if="location">
              Latitude: {{ location.latitude }}, Longitude:
              {{ location.longitude }}
            </p>
            <p v-else>No Location will be sent</p>
            <div id="map" style="height: 200px"></div>
          </div>
        </div>

        <div class="col">
          <!-- Media form group goes here -->
          <div class="form-group">
            <label for="media">Media:</label>
            <input
              type="file"
              id="media"
              @change="handleFileUpload"
              accept="image/*"
              class="form-control-file"
            />
            <button v-if="media" @click="media = null" class="btn btn-danger">
              X
            </button>
          </div>
          <div v-if="media">
            <p>Uploaded file:</p>
            <img
              v-if="mediaUrl"
              :src="mediaUrl"
              alt="uploaded file"
              style="max-width: 50vw; max-height: 50vh"
            />
          </div>
          <p v-else>No file selected</p>
        </div>
      </div>
      <div class="form-group">
        <label for="reply_to">Reply To:</label>
        <input
          type="text"
          id="reply_to"
          v-model="reply_to"
          class="form-control"
        />
      </div>
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default {
  data() {
    return {
      author: "",
      text: "",
      receiver: "",
      media: null,
      reply_to: "",
      credits: [],
      temp_credits: [],
      charCount: 0,
      media_value: 0,
      map_value: 0,
      location: null,
    };
  },
  // mounted: function that gets called when page loads
  mounted() {
    // retrieve credits
    const profile = "Luizo"; // TODO replace with $user
    axios
      .get("https://site222326.tw.cs.unibo.it/profiles/" + profile)
      .then((response) => {
        console.log("response: ", response.data);
        this.credits = response.data.credit;
        this.temp_credits = response.data.credit;
        console.log("credits: ", this.credits);
      })
      .catch((error) => {
        console.log(error);
      });
  },
  computed: {
    mediaUrl() {
      return URL.createObjectURL(this.media);
    },
  },
  methods: {
    handleFileUpload(event) {
      console.log("file uploaded");
      this.media = event.target.files[0];
    },
    submitForm() {
      const jsonBody = {
        author: this.author,
        text: this.text,
        receiver: this.receiver,
        reply_to: this.reply_to,
        is_private: false,
        location: this.location,
      };
      const formData = new FormData();
      formData.append("json", JSON.stringify(jsonBody));
      formData.append("file", this.media);

      console.log("sending body: ", formData);
      // Send formData to server using axios or fetch
      axios
        .put("https://site222326.tw.cs.unibo.it/squeals/", formData)
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    updateCreditsOnScreen(newText) {
      if (newText != null) {
        this.charCount = newText.length; // Update charCount when text changes
      }
      this.temp_credits = JSON.parse(JSON.stringify(this.credits)); // Create a deep copy of credits
      for (let field in this.temp_credits) {
        this.temp_credits[field] -=
          this.charCount + this.media_value + this.map_value;
      }
      console.log("credits: ", this.credits);
    },
    getGeolocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          this.showMap();
        });
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    },
    showMap() {
      const map = L.map("map").setView(
        [this.location.latitude, this.location.longitude],
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
      L.marker([this.location.latitude, this.location.longitude], {icon: customIcon}).addTo(map);
    },
  },
  // watch: listeners
  watch: {
    text(newText) {
      console.log("text changed: ", newText);
      this.updateCreditsOnScreen(newText);
    },
    media(newMedia) {
      console.log("media changed: ", newMedia);
      if (newMedia) this.media_value = 125;
      else this.media_value = 0;

      console.log("media value: ", this.media_value);
      this.updateCreditsOnScreen(null);
    },
    location(newLocation) {
      console.log("location changed: ", newLocation);
      if (newLocation) this.map_value = 125;
      else this.map_value = 0;

      console.log("map value: ", this.map_value);
      this.updateCreditsOnScreen(null);
    },
  },
};
</script>
