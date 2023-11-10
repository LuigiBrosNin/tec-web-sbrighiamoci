<template>
  <div class="row">
    <div class="col-sm-6">
      <!-- get current profile pic, if null, get default one -->
      <img class="profile_img img-fluid rounded-circle" :src="profilePicUrl" />
    </div>
    <div class="col-sm-6">
      <div class="input-group mb-3">
        <div class="custom-file">
          <input
            type="file"
            class="custom-file-input"
            id="inputGroupFile01"
            @change="handleFileUpload"
            accept="image/*"
          />
          <label class="custom-file-label" for="inputGroupFile01"
            >Choose your new profile picture</label
          >
        </div>
        <div class="input-group-append">
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="uploadFile"
          >
            Upload
          </button>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- display current bio -->
      <div class="form-group">
        <label for="bio">Current Bio</label>
        <textarea
          class="form-control"
          id="bio"
          placeholder={{
          current_bio
          }}
          disabled
        ></textarea>
      </div>
      <div class="form-group">
        <label for="bio">Bio</label>
        <textarea
          class="form-control"
          id="bio"
          placeholder={{
          bio
          }}
          v-model="bio"
        ></textarea>
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
      <!-- display current email-->
      <div class="form-group">
        <label for="email">Current Email</label>
        <input
          type="email"
          class="form-control"
          id="email"
          placeholder={{
          current_email
          }}
          disabled
        />
      </div>

      <div class="form-group">
        <label for="email">Change Email</label>
        <input type="email" class="form-control" id="email" v-model="email" />
      </div>

      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
  <!-- spaced button to delete account -->
    <div class="row">
        <div class="col-sm-12">
        <button type="button" class="btn btn-danger btn-lg btn-block" :on-click="deleteAccount()">
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
    const name_of_profile = $user;
    axios.get(`/profiles/${name_of_profile}`).then((response) => {
      console.log(response.data);
      // Populate the form with the data returned
      this.current_bio = response.data.bio;
      this.bio = response.data.bio;
      this.current_email = response.data.email;
      this.email = response.data.email;
      this.profilePicUrl = response.propic;
      // if propic returns null, use a default one
      if (this.profilePicUrl == null || this.profilePicUrl == "") {
        this.profilePicUrl =
          "https://site222326.tw.cs.unibo.it/images/user-default.svg";
      } else {
        this.profilePicUrl = `https://site222326.tw.cs.unibo.it/profiles/${this.author}/propic`;
      }
    });
  },
  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
    },
    uploadFile() {
      const formData = new FormData();
      const name_of_profile = $user;
      formData.append("file", this.file);
      axios
        .put(`/profiles/${name_of_profile}/propic`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            console.log(
              "Upload progress:" +
                Math.round((progressEvent.loaded / progressEvent.total) * 100) +
                "%"
            );
          },
        })
        .then((response) => {
          console.log(response.data);
        });
    },
    handleSubmit() {
      //TODO Send a POST request to /profiles/$user
      // Handle form submission
    },
    deleteAccount() {
      //TODO Send a DELETE request to /profiles/$user
      // Handle form submission
    },
  },
};
</script>
