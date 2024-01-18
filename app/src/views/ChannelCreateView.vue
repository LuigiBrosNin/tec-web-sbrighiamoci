<template>

  <div class="squeal_container">
    <form @submit.prevent="createChannel" class="mt-5" aria-labelledby="createChannelTitle">

      <!-- Titolo -->
      <h3 class="title"> Create your channel </h3>

      <!-- Tipo -->
        <label for="channelType"> Channel type: </label>
        <select v-model="channel_type" id="channelType" name="channelType" class="form-select mb-3">
          <option value="privileged">  Privileged   </option>
          <option value="private">     Private      </option>
          <option value="required">    Required     </option>
        </select>

      <!-- Nome e bio -->
      <div class="input-group mb-3 flex-column">
        <div class="mb-3">
          <input type="text" placeholder="Choose a name for the channel..." v-model="new_channel_name" required class="form-control" />
        </div>
        <div class="mb-3">
          <textarea placeholder="Write a bio..." v-model="new_bio" class="form-control"></textarea>
        </div>
      </div>

      <!-- Submit -->
      <button type="submit" class="btn btn-primary d-block mx-auto orange_btn"> Submit </button>

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
        new_channel_name: "",
        tmp_channel_name: "",
        new_bio: "",
        channel_type: "",
        max_bio_length: 150,
        profilePicUrl: "",
      };
    },
    methods: {

      async createChannel() {
        try {
          if (this.new_bio.length <= this.max_bio_length) {
            const response = await axios.put(`https://site222326.tw.cs.unibo.it/channels/${this.new_channel_name}`, { bio: this.new_bio, type: this.channel_type } );
            if (response.status === 409) {
              alert("Channel name already taken, choose a different one.");
            }
            else if (response.status === 401) {
              alert("You're not authorized to create this channel.")
            }
            else if (response.status === 200) {
              alert("Channel succesfully created!");
            }
            else {
              alert("Something did not work, try later!");
              console.error("Unexpected response status: ", response.status);
            }
          }
          else { alert("Bio too long."); }
        }
        catch (error) {
          console.error("An error occured: ", error);
        }
      },

    }
}
  
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

  .title {
    text-align: center;
    margin-bottom: 20px; 
  }

  .btn_dim {
    width: 5%;
  }

  .orange_btn {
    background-color: #ff8900; 
    color: white;
  }

  .orange_btn_low {
    background-color: #ffa947; 
    color: white;
  }

  .profile_img {
    width: 10em;
    height: 10em;
    border-radius: 50%;
    margin: 0.5em;
  }
</style>