<template>
  <div class="row options_container">
    <div>
      <div class="row">
        <div class="col-sm-6">
          <!-- Current profile pic -->
          <img
            class="profile_img img-fluid rounded-circle"
            :src="profilePicUrl"
          />
        </div>
        <div class="col-sm-6">
          <!-- New profile pic preview -->
          <img
            v-if="file"
            class="profile_img img-fluid rounded-circle"
            :src="mediaUrl"
            alt="uploaded file"
          />
          <img
            v-else
            class="profile_img img-fluid rounded-circle"
            :src="profilePicUrl"
          />
        </div>
      </div>
      <!-- File uploader -->
      <div class="input-group mb-3">
        <div class="custom-file">
          <input
            type="file"
            class="form-control"
            id="inputGroupFile01"
            @change="handleFileUpload"
            accept="image/*"
          />
        </div>
        <div class="input-group-append">
          <button class="btn btn-outline-secondary button-spacing" type="button" @click="uploadFile">Upload</button>
          <button v-if="file" @click="file = null" class="btn btn-danger button-spacing">X</button>
          <button v-else class="btn btn-danger" @click="removePic">Remove current propic</button>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="mt-4">
      <!-- display current bio -->
      <div class="form-group">
        <label for="bio">Current Bio</label>
        <textarea
          class="form-control"
          id="bio"
          :placeholder="current_bio"
          disabled
        ></textarea>
      </div>
      <div class="form-group">
        <label for="bio">Bio</label>
        <textarea
          class="form-control"
          id="bio"
          :placeholder="bio"
          v-model="bio"
        ></textarea>
      </div>

      <!-- display current email-->
      <div class="form-group">
        <label for="email">Current Email</label>
        <input
          type="email"
          class="form-control"
          id="email"
          :placeholder="current_email"
          disabled
        />
      </div>

      <div class="form-group">
        <label for="email">Change Email</label>
        <input type="email" class="form-control" id="email" v-model="email" />
      </div>

      <div class="form-group">
        <label for="password">Change Password</label>
        <input
          type="password"
          class="form-control"
          id="password"
          v-model="password"
        />
      </div>

      <div class="form-group text-center">
        <button type="submit" class="btn btn-primary mt-3" style="background-color: #ff8900;">Submit</button>
      </div>
    </form>
  </div>
  <!-- spaced button to delete account -->
  <div class="card mt-4 options_container">
    <div class="card-body">
      <h5 class="card-title">Delete Account</h5>
      <p class="card-text">Logged in as: {{ $user }}</p>
      <button type="button" class="btn btn-danger" @click="deleteAccount">
        Delete Account
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      file: null,
      bio: "",
      password: "",
      email: "",
      current_bio: "",
      current_email: "",
      profilePicUrl: "",
    };
  },
  mounted() {
    //Send a GET request to /profiles/$user
    const name_of_profile = this.$user;
    axios
      .get(`https://site222326.tw.cs.unibo.it/profiles/${name_of_profile}`)
      .then((response) => {
        console.log(response.data);
        // Populate the form with the data returned
        this.current_bio = response.data.bio;
        this.bio = response.data.bio;
        this.current_email = response.data.email;
        this.email = response.data.email;
        this.profilePicUrl = response.data.propic;
        // if propic returns null, use a default one
        console.log(this.profilePicUrl)
        if (this.profilePicUrl == null || this.profilePicUrl == "") {
          this.profilePicUrl =
            "https://site222326.tw.cs.unibo.it/images/user-default.svg";
        } else {
          this.profilePicUrl = `https://site222326.tw.cs.unibo.it/profiles/${name_of_profile}/propic`;
        }
      });
  },
  computed: {
    mediaUrl() {
      console.log("url: " + URL.createObjectURL(this.file));
      return URL.createObjectURL(this.file);
    },
  },
  methods: {
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
    },
    removePic() {
      const name_of_profile = this.$user;
      axios
        .delete(
          `https://site222326.tw.cs.unibo.it/profiles/${name_of_profile}/propic`
        )
        .then((response) => {
          console.log(response.data);
          // notify the user that the upload was successful
          alert("Profile picture removed");
          profilePicUrl =
            "https://site222326.tw.cs.unibo.it/images/user-default.svg";
        });
    },
    handleSubmit() {
      //TODO Send a POST request to /profiles/$user
      // Handle form submission
      const name_of_profile = this.$user;
      const jsonBody = {
        bio: this.bio,
        email: this.email,
        password: this.password,
      };
      axios
        .post(`https://site222326.tw.cs.unibo.it/profiles/${name_of_profile}`, jsonBody)
        .then((response) => {
          console.log(response.data);
          // notify the user that the upload was successful
          alert("Profile updated");
          this.current_bio = this.bio;
          this.current_email = this.email;
        });

    },
    deleteAccount() {
      // send a message to the user asking for confirmation
      if (confirm("Are you sure you want to delete your account?")) {
        //TODO Send a DELETE request to /profiles/$user
        const name_of_profile = this.$user;
        axios
          .delete(`https://site222326.tw.cs.unibo.it/profiles/${name_of_profile}`)
          .then((response) => {
            console.log(response.data);
            // notify the user that the upload was successful
            alert("Account deleted");
            // redirect to login page
            window.location.href = ("https://site222326.tw.cs.unibo.it/login");
          });
      }
    },
  },
};
</script>

<style scoped>
.options_container {
  background-color: #fff;
  border-style: solid;
  border-width: thin;
  border-radius: 1em;
  border-color: #616161;
  margin: 0.5em 1em 0.5em 1em;
  padding: 1em;
}
.profile_img {
  width: 16em;
  height: 16em;
  border-radius: 50%;
  margin: 0.5em;
}

.button-spacing {
  margin-right: 10px !important;
  margin-left: 10px !important;
}

</style>
