<template>

  <!-------------------- CREAZIONE CANALE --------------------->
  <div class="squeal_container">
    <form @submit.prevent="submitFormCreate" class="mt-5">

      <!-- Titolo -->
      <h3 class="title"> Create your channel </h3>

      <!-- Nome e bio -->
      <div class="input-group mb-3 flex-column">
        <div class="mb-3">
          <input type="text" placeholder="Choose a name for the channel..." v-model="channel_name" required class="form-control" />
        </div>
        <div class="mb-3">
          <input type="text" placeholder="Write a bio..." v-model="bio" class="form-control" />
        </div>
      </div>

      <!-- Submit -->
      <button type="submit" class="btn btn-primary d-block mx-auto" style="background-color: #ff8900; color: white"> Submit </button>

    </form>
  </div>

  <!-------------------- MODIFICA CANALE --------------------->
  <div class="squeal_container">
    <form @submit.prevent="submitFormModify" class="mt-5">

      <!-- Titolo -->
      <h3 class="title"> Modify your channel </h3>

      <!-- Ricerca canale -->
      <div class="input-group mb-3 flex-column">
        <div class="mb-3">
          <input type="text" placeholder="Search a channel..." v-model="search_channel_name" required class="form-control mb-3" />
          <button @click="searchChannel" class="btn btn-primary d-block mx-auto" style="background-color: #ff8900; color: white"> Search </button>
        </div>
      </div>

      <!-- Sezione di modifica -->
      <div v-if="show_inputs">
        <!-- Bio -->
        <div class="mb-3">
          <input type="text" placeholder="Write a new bio..." v-model="bio" required class="form-control" />
        </div>
        
        <!-- Tipo -->
        <label for="channelType">Tipo di canale:</label>
        <select v-model="channel_type" id="channelType" name="channelType" class="form-select">
          <option value="privileged">  Privileged   </option>
          <option value="private">     Private      </option>
          <option value="required">    Required     </option>
        </select>

        <!-- Mods -->
        <div>
          <label for="nameInput">Inserisci il nome:</label>
          <input v-model="current_mod" type="text" id="nameInput" />

          <button @click.prevent="addMod">Aggiungi Nome</button>
        </div>

        <div v-if="mods.length > 0">
          <h2>Nomi inseriti:</h2>
          <ul>
            <li v-for="(name, index) in mods" :key="index">{{ name }}</li>
          </ul>
        </div>
        

        <!-- Propic -->
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
        
          
          <!-- Submit -->
        <button type="submit" class="btn btn-primary" style="background-color: #ff8900; color: white"> Submit </button>
      </div>
    </form>
  </div>

<!-- 

	- dare un nome al canale (se esiste già o è esistito negare permesso)
	- dare il nome dell'owner (profilo che lo sta creando?)
	- scegliere tipo di canale (tre opzioni: privileged, private, required )
	- dare i nomi dei mods
	- impostare una propic
	- scrivere una bio
	- inizializzare numero followers

 -->

</template>

<script>
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default {
  data() {
    return {
      channel_name: "",
      channel_type: "",
      bio: "",
      mods: [],
      current_mod: "",
      max_bio_length: 150,
      show_inputs: false,
      search_channel_name: "",
    };
  },
  // mounted: function that gets called when page loads
  mounted() {
    
  },
  methods: {

    async submitFormCreate() {
      try {
        if (this.bio.length <= this.max_bio_length) {
          console.log("Creo canale con nome: ", this.channel_name);
          const response = await axios.put(`https://site222326.tw.cs.unibo.it/channels/${this.channel_name}`);
          if (response.status === 409) {
            alert("Channel name already taken, choose a different one.");
          }
          else if (response.status === 200) {
            alert("Channel succesfully created!");
          }
          else {
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
          console.log("cerco canale: ", this.search_channel_name)
          console.log("response: ", response)

          this.show_inputs = true;
          
        }
        else {
          alert("Canale non trovato.");
        }
      }
      catch (error) {
        console.error("An error occured: ", error);
      }
    },

    submitFormModify() {
      return true;
    },

    

    addMod() {
      //TODO controllare ad ogni aggiunta di nome se è valido
      if (this.current_mod.trim() !== '') {
        this.mods.push(this.current_mod.trim());
        this.current_mod = ''; 
      }
    },







  ///////////////////////////////////////////////////////////////////////
    handleFileUpload(event) {
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
    }
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

</style>