<script setup>
  import router from '@/router/index.js'
</script>

<template>
  <div class="squeal_container">
    <form @submit.prevent="submitForm" class="mt-5">
      <div class="input-group mb-3">
        <span class="input-group-text" id="basic-addon1">§</span>
        <input type="text" id="receiver" placeholder="Select a channel to squeal to" v-model="receiver" required
          class="form-control" />
      </div>
      <div class="profile_data">
        <img class="profile_img" :src="propic" />
        <RouterLink :to="`/profile/${$user}`" class="profile_name">
          @{{ $user }}</RouterLink>
      </div>
      <div class="form-group">
        <label for="text">Text:</label>
        <textarea id="text" v-model="text" required class="form-control"></textarea>
        <div>
          <div class="credits-container">
            <span v-for="(credit, index) in temp_credits" :key="credit.id"
              :class="{ positive: credit > 0, negative: credit <= 0 }">
              {{ creditLabels[index] }}: {{ credit }}&nbsp;&nbsp;
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
      </div>
      <div class="row">
        <div class="col">
          <div class="form-group">
            <label for="location" class="form-label">Location:</label>
            <button @click="getGeolocation" class="btn btn-info">
              Include Geolocation in your Squeal
            </button>
            <button v-if="location" @click="
                            {
              location = null;
              if(map != null){ destroyMap() }
            }
              " class="btn btn-warning">
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
          <div class="form-group">
            <label for="media" class="form-label">Media:</label>
            <input type="file" id="media" @change="handleFileUpload" accept="image/*" class="form-control" />
            <button v-if="media" @click="media = null" class="btn btn-danger">
              X
            </button>
          </div>
          <div v-if="media">
            <p>Uploaded file:</p>
            <img v-if="mediaUrl" :src="mediaUrl" alt="uploaded file" style="max-width: 50vw; max-height: 50vh" />
          </div>
          <p v-else>No file selected</p>
        </div>
      </div> 
      <!-- TODO REMOVE WHEN WE IMPLEMENT AUTOMATIC REPLIES-->
      
      <div class="form-group">
        <label for="reply_to">Reply To:</label>
        <input type="text" id="reply_to" v-model="reply_to" class="form-control" />
      </div>
      <button type="submit" class="btn btn-primary" style="background-color: #ff8900; color: white">
        Submit
      </button>
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
      creditLabels: ["daily", "weekly", "monthly"],
      propic: null,

      map: null,
    };
  },
  // mounted: function that gets called when page loads
  mounted() {
    // retrieve credits
    const profile = this.$user;

    axios
      .get("https://site222326.tw.cs.unibo.it/profiles/" + profile)
      .then((response) => {
        console.log("response: ", response.data);
        this.credits = response.data.credit;
        this.temp_credits = response.data.credit;
        this.propic = response.data.propic;
        if (this.propic == null || this.propic == "") {
          this.propic =
            "https://site222326.tw.cs.unibo.it/images/user-default.svg";
        } else {
          this.propic = `https://site222326.tw.cs.unibo.it/profiles/${profile}/propic`;
        }
        console.log("credits: ", this.credits);

        // update credits on screen
        if (this.$route.query.replyto)
          this.reply_to = this.$route.query.replyto;

        if (this.$route.query.receiver)
          this.receiver = this.$route.query.receiver;
          
        if (this.$route.query.text) {
          this.text = this.$route.query.text;
          this.updateCreditsOnScreen(this.text);
        }
         

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
        author: this.$user,
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
          if(response.status == 200) {
            //router.push({ path: `/squeal/id` }); //TODO
          } else {
            alert("an error has occurred, please try again later");
          }
        })
        .catch((error) => {
          console.log(error);
          alert("an error has occurred, please try again later");
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
          this.map = this.showMap();
        });
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    },
    showMap() {
      if(this.map != null){
        this.destroyMap();
      }
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
      L.marker([this.location.latitude, this.location.longitude], {
        icon: customIcon,
      }).addTo(map);
      return map;
    },
    destroyMap() {
      this.map.remove();
      console.log(document);
      console.log(this.map._container.id);
      document.getElementById(this.map._container.id).style.setProperty('background-color', '#fff', 'important'); 
      this.map = null;
    }
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

<style scoped>
.squeal_container {
  background-color: #fff;
  border-style: solid;
  border-width: thin;
  border-radius: 1em;
  border-color: #616161;
  margin: 0.5em 2em 0.5em 2em;
  padding: 1em;
}

.form-group {
  margin-bottom: 20px;
  /* Add spacing between form groups */
}

.form-group button {
  background-color: #ff8900;
  /* Change button color */
  color: white;
  /* Change button text color */
  margin-top: 10px;
  /* Add spacing above the button */
  display: block;
  /* Make the button a block element */
  margin-left: auto;
  /* Center the button */
  margin-right: auto;
}

button[type="submit"] {
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.credits-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.positive {
  color: green;
}

.negative {
  color: red;
}

.profile_data {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.profile_img {
  width: 4em;
  height: 4em;
  border-radius: 50%;
  margin: 0.5em;
}

.profile_name {
  font-size: 1.3em;
}
</style>

