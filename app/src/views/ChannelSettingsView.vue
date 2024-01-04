<template>
    <!-------------------- MODIFICA CANALE --------------------->
    <div v-if="activeSection === 'modify'" class="squeal_container">

      <!-- Titolo -->
      <h3 class="title"> Modify your channel </h3>

      <!-- Ricerca canale -->
      <div class="input-group mb-3 flex-column">
        <div class="mb-3">
          <label for="modsInput"> Channel name: </label>
          <input type="text" placeholder="Search a channel..." v-model="tmp_channel_name" class="form-control mb-3" />
          <button @click="searchChannel" class="btn d-block mx-auto orange_btn mb-5"> Search </button>
        </div>
      </div>

      <!-- Sezione di modifica -->
      <div v-if="show_inputs">

        <!-- Propic -->
        <div class="flex-column">
          <label for=""> Actual profile picture: </label>
          <img class="img-fluid rounded-circle profile_img" :src="profilePicUrl" />
        </div>
        <div class="input-group mb-3 flex-column">
          <div class="custom-file my-3">
            <label for="" class="mb-1"> Choose a new profile picture: </label>
            <input type="file" class="form-control my-2" id="inputGroupFile01" @change="handleFileUpload" accept="image/*" />
          </div>
          <div class="input-group-append">
            <button class="btn btn-outline-secondary button-spacing" type="button" @click="uploadFile">Upload</button>
            <button v-if="file" @click="file = null" class="btn btn-danger button-spacing">X</button>
            <button v-else class="btn btn-danger" @click="removePic">Remove current propic</button>
          </div>
        </div>

        <!-- Bio -->
        <div class="input-group mb-3 flex-column">
          <div class="mb-3">
            <label for="channelType"> Bio: </label>
            <input type="text" placeholder="Write a new bio..." v-model="bio" class="form-control mb-3" />
            <button @click="updateBio" class="btn d-block mx-auto orange_btn"> Update Bio </button>
          </div>
        </div>
      
        <!-- Mods -->
        <div v-if="show_inputs">
          <div class="mb-3">
            <label for="modsInput"> Add a mod: </label>
            <div class="input-group">
              <input v-model="mod_to_add" type="text" id="modsInput" class="form-control" />
              <div>
                <button @click="addMod" class="btn btn-primary "> Insert </button>
              </div>
            </div>
          </div>
        
          <div v-if="mods.length > 0">
            <label> Actual mods: </label>
            <ul class="list-group mb-3">
              <li v-for="(name, index) in mods" :key="index" class="list-group-item d-flex justify-content-between align-items-center">{{ name }}
                <button @click="removeMod(index)" class="btn btn-danger "> Remove </button> 
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
</template>

<script>
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default {
  data() {
    return { //TODO eliminare variabili non usate
      activeSection: 'create',
      new_channel_name: "",
      tmp_channel_name: "",
      new_bio: "",
      channel_type: "",
      bio: "",
      mods: [],
      mod_to_add: "",
      max_bio_length: 150,
      show_inputs: false,
      search_channel_name: "",
      file: null,
      profilePicUrl: "",
    };
  },
  methods: {

    async searchChannel() {
      try {
        this.search_channel_name = this.tmp_channel_name
        const response = await axios.get(`https://site222326.tw.cs.unibo.it/channels/${this.search_channel_name}`);
        if (response.status === 200) {
          this.show_inputs = true;
          this.bio = response.data.bio;
          this.channel_type = response.data.type;
          this.mods = response.data.mod_list;

          this.profilePicUrl = response.data.propic

          // <!--TODO  questa cosa della propic non funziona piu'
          if (this.profilePicUrl == null || this.profilePicUrl == "") {
            console.log("La propic è null.")
            this.profilePicUrl =
              "https://site222326.tw.cs.unibo.it/images/user-default.svg";
          }
          else {
            console.log("La propic esiste.")
            this.profilePicUrl = `https://site222326.tw.cs.unibo.it/channels/${this.search_channel_name}/propic`;
          }
        }
        else { alert("Canale non trovato."); }
      }
      catch (error) { console.error("An error occured: ", error); }
    },

    async updateBio() {
      const response = await axios.post(`https://site222326.tw.cs.unibo.it/channels/${this.search_channel_name}`, { bio: this.bio });

      if (response.status === 401) {
        alert("You're not authorized to modify this channel.")
      }
      else if (response.status === 404) {
        alert("Channel not found.")
      }
      else if (response.status === 200) {
        alert("Channel updated succesfully!")
      }
    },

    async addMod() {
      const response = await axios.put(`https://site222326.tw.cs.unibo.it/channels/${this.search_channel_name}/mod_list`, { mod_name: this.mod_to_add });

      if (response.status === 400) {
        alert("This mod is already on the list.")
      }
      else if (response.status === 404) {
        alert("Channel or profile not found.")
      }
      else if (response.status === 401) {
        alert("You're not authorized to modify the mods list.")
      }
      else if (response.status === 200) {
        alert("Mod succesfully added!")

        // dopo aver aggiunto un mod, ricarico la lista
        const response = await axios.get(`https://site222326.tw.cs.unibo.it/channels/${this.search_channel_name}`);
        this.mods = response.data.mod_list;
        this.mod_to_add = "";
      }
    },

    async removeMod(index) {
      const mod_to_remove = this.mods.splice(index, 1)
      console.log("rimuovo mod: ", mod_to_remove)
      const response = await axios.delete(`https://site222326.tw.cs.unibo.it/channels/${this.search_channel_name}/mod_list`, { data: { mod_name: mod_to_remove } });

      if (response.status === 404) {
        alert("Channel or profile not found.")
      }
      else if (response.status === 401) {
        alert("You're not authorized to modify the mods list.")
      }
      else if (response.status === 200) {
        alert("Mod succesfully removed!")

        // dopo aver rimosso un mod, ricarico la lista
        const response = await axios.get(`https://site222326.tw.cs.unibo.it/channels/${this.search_channel_name}`);
        this.mods = response.data.mod_list;
        this.mod_to_add = "";
      }
    },

    handleFileUpload(event) {
      this.file = event.target.files[0];
    },

    uploadFile() {
      const formData = new FormData();
      formData.append("file", this.file);

      console.log("FORMDATA: ", formData)
      console.log("CHANNELNAME: ", this.search_channel_name)

      axios
        .put(
          `https://site222326.tw.cs.unibo.it/channels/${this.search_channel_name}/propic`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              console.log(
                "Upload progress:" +
                Math.round(
                  (progressEvent.loaded / progressEvent.total) * 100
                ) +
                "%"
              );
            },
          }
        )
        .then((response) => {
          console.log(response.data);
          // notify the user that the upload was successful
          alert("Upload successful");
          this.profilePicUrl = `https://site222326.tw.cs.unibo.it/channels/${this.search_channel_name}/propic`;
        });
    },

    removePic() {
      const name_of_profile = this.$user;
      axios
        .delete(
          `https://site222326.tw.cs.unibo.it/channels/${this.search_channel_name}/propic`
        )
        .then((response) => {
          console.log(response.data);
          // notify the user that the upload was successful
          alert("Profile picture removed");
          profilePicUrl =
            "https://site222326.tw.cs.unibo.it/images/user-default.svg";
        });
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