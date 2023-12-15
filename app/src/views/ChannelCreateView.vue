<template>

  <!-- Pulsanti di commutazione -->
  <div class="d-flex justify-content-center my-3">
    <button @click="showCreateSection" class="btn mx-2" :class="{ 'orange_btn': activeSection === 'create', 'btn-secondary': activeSection !== 'create' }">Create Channel</button>
    <button @click="showModifySection" class="btn mx-2" :class="{ 'orange_btn': activeSection === 'modify', 'btn-secondary': activeSection !== 'modify' }">Modify Channel</button>
  </div>

  <!-------------------- CREAZIONE CANALE --------------------->
  <div v-if="activeSection === 'create'" class="squeal_container">
    <form @submit.prevent="createChannel" class="mt-5">

      <!-- Titolo -->
      <h3 class="title"> Create your channel </h3>

      <!-- Nome e bio -->
      <div class="input-group mb-3 flex-column">
        <div class="mb-3">
          <input type="text" placeholder="Choose a name for the channel..." v-model="new_channel_name" required class="form-control" />
        </div>
        <div class="mb-3">
          <input type="text" placeholder="Write a bio..." v-model="new_bio" class="form-control" />
        </div>
      </div>

      <!-- Submit -->
      <button type="submit" class="btn btn-primary d-block mx-auto orange_btn"> Submit </button>

    </form>
  </div>

  <!-------------------- MODIFICA CANALE --------------------->
  <div v-if="activeSection === 'modify'" class="squeal_container">
    <form @submit.prevent="submitFormModify" class="mt-5">

      <!-- Titolo -->
      <h3 class="title"> Modify your channel </h3>

      <!-- Ricerca canale -->
      <div class="input-group mb-3 flex-column">
        <div class="mb-3">
          <label for="modsInput"> Channel name: </label>
          <input type="text" placeholder="Search a channel..." v-model="search_channel_name" class="form-control mb-3" />
          <button @click="searchChannel" class="btn btn-primary d-block mx-auto orange_btn"> Search </button>
        </div>
      </div>

      <!-- Sezione di modifica -->
      <div v-if="show_inputs">

        <!-- Bio -->
        <div class="mb-3">
          <label for="channelType"> Bio: </label>
          <input type="text" placeholder="Write a new bio..." v-model="bio" required class="form-control" />
        </div>
        
        <!-- Tipo -->
        <label for="channelType"> Channel type: </label>
        <select v-model="channel_type" id="channelType" name="channelType" class="form-select mb-3">
          <option value="privileged">  Privileged   </option>
          <option value="private">     Private      </option>
          <option value="required">    Required     </option>
        </select>

        <!-- Mods -->
        <div v-if="show_inputs">
          <div class="mb-3">
            <label for="modsInput"> Add un mod: </label>
            <div class="input-group">
              <input v-model="mods" type="text" id="modsInput" class="form-control" />
              <button @click.prevent="addMod" class="btn btn-primary"> Aggiungi </button>
            </div>
          </div>

          <div v-if="mods.length > 0">
            <h2> Mod attuali: </h2>
            <ul class="list-group mb-3">
              <li v-for="(name, index) in mods" :key="index" class="list-group-item">{{ name }}</li>
            </ul>
          </div>
        </div>

        <!-- Propic -->
        <!--
        <div class="input-group mb-3">
          <div class="custom-file">
            <input type="file" class="form-control" id="inputGroupFile01" @change="handleFileUpload" accept="image/*" />
          </div>
            <div class="input-group-append">
              <button class="btn btn-outline-secondary button-spacing" type="button" @click="uploadFile">Upload</button>
              <button v-if="file" @click="file = null" class="btn btn-danger button-spacing">X</button>
              <button v-else class="btn btn-danger" @click="removePic">Remove current propic</button>
            </div>
          </div>
        -->

          <!-- Submit -->
        <button type="submit" class="btn btn-primary orange_btn"> Submit </button>
      </div>

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
      activeSection: 'create', // Valore predefinito per la sezione attiva
      new_channel_name: "",
      new_bio: "",
      channel_type: "",
      bio: "",
      mods: ["toni", "bepi"],
      mod_to_add: "",
      max_bio_length: 150,
      show_inputs: false,
      search_channel_name: "",
    };
  },
  // mounted: function that gets called when page loads
  mounted() {
    
  },
  methods: {

    async createChannel() {
      try {
        if (this.new_bio.length <= this.max_bio_length) {
          const response = await axios.put(`https://site222326.tw.cs.unibo.it/channels/${this.new_channel_name}`, { bio: this.new_bio } );
          if (response.status === 409) {
            alert("Channel name already taken, choose a different one.");
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

    async searchChannel() {
      try {
        const response = await axios.get(`https://site222326.tw.cs.unibo.it/channels/${this.search_channel_name}`);
        if (response.status === 200) {
          this.show_inputs = true;
          this.bio = response.data.bio;
          this.channel_type = response.data.type;
          //this.mods = response.data.mod_list;  
        }
        else { alert("Canale non trovato."); }
      }
      catch (error) { console.error("An error occured: ", error); }
    },

    submitFormModify() {
      return true;
    },

    addMod() {
      //TODO controllare ad ogni aggiunta di nome se è valido
      
    },

    showCreateSection() {
      this.activeSection = 'create';
    },
    showModifySection() {
      this.activeSection = 'modify';
    },





  ///////////////////////////////////////////////////////////////////////
  /*  handleFileUpload(event) {
      console.log("file uploaded");
      this.file = event.target.files[0];
    },

    uploadFile() {
      const formData = new FormData();
      const name_of_profile = this.$user;
      formData.append("file", this.file);
      axios
        .put(
          `https://site222326.tw.cs.unibo.it/profiles/${name_of_profile}/propic`,
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
          this.profilePicUrl = `https://site222326.tw.cs.unibo.it/profiles/${name_of_profile}/propic`;
        });
    }*/
  ///////////////////////////////////////////////////////////////////////
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

  .orange_btn {
    background-color: #ff8900; 
    color: white;
  }

  .orange_btn_low {
    background-color: #ffa947; 
    color: white;
  }

</style>