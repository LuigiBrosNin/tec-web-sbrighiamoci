<script setup>
import ProfileCard from "@/components/ProfileCard.vue"

const props = defineProps(["id"]);
</script>

<template>
  <div v-if="id == $user">
    <div class="row options_container">
      <div>
        <div class="row">
          <div class="col-sm-6">
            <!-- Current profile pic -->
            <img class="profile_img img-fluid rounded-circle" :src="profilePicUrl" />
          </div>
          <div class="col-sm-6">
            <!-- New profile pic preview -->
            <img v-if="file" class="profile_img img-fluid rounded-circle" :src="mediaUrl" alt="uploaded file" />
            <img v-else class="profile_img img-fluid rounded-circle" :src="profilePicUrl" />
          </div>
        </div>
        <!-- File uploader -->
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
      </div>

      <form @submit.prevent="handleSubmit" class="mt-4">
        <!-- display current bio -->
        <div class="form-group">
          <label for="bio">Current Bio</label>
          <textarea class="form-control" id="bio" :placeholder="current_bio" disabled></textarea>
        </div>
        <div class="form-group">
          <label for="bio">Bio</label>
          <textarea class="form-control" id="bio" :placeholder="bio" v-model="bio"></textarea>
        </div>

        <!-- display current email-->
        <div class="form-group">
          <label for="email">Current Email</label>
          <input type="email" class="form-control" id="email" :placeholder="current_email" disabled />
        </div>

        <div class="form-group">
          <label for="email">Change Email</label>
          <input type="email" class="form-control" id="email" v-model="email" />
        </div>

        <div class="form-group">
          <label for="password">Change Password</label>
          <input type="password" class="form-control" id="password" v-model="password" />
        </div>

        <div class="form-group text-center">
          <button type="submit" class="btn btn-primary mt-3" style="background-color: #ff8900;">Submit</button>
        </div>
      </form>
    </div>

    <!-- spaced div to switch account type -->
    <div class="card mt-4 options_container" v-if="current_account_type != 'admin'">
      <div class="card-body">
        <h5 class="card-title">Switch Account Type</h5>
        <p class="card-text">Logged in as: {{ $user }}</p>
        <p class="card-text">Current account type: {{ current_account_type }}</p>
        <button type="button" v-if="current_account_type != 'premium'" class="btn btn-primary mb-3"
          style="background-color: #ff8900;" @click="changeAccountType('premium')">
          Switch to Premium, 10€/month
        </button>
        <button type="button" v-if="current_account_type != 'smm'" class="btn btn-primary mb-3"
          style="background-color: #ff8900;" @click="changeAccountType('smm')">
          Switch to SMM, 15€/month
        </button>
        <button type="button" v-if="current_account_type != 'normal'" class="btn btn-primary mb-3"
          style="background-color: #ff8900;" @click="changeAccountType('normal')">
          Switch to User, free
        </button>
      </div>
    </div>

    <!-- spaced div to insert an smm if you're premium-->
    <div class="card mt-4 options_container" v-if="current_account_type == 'premium'">
      <div class="card-body">
        <h5 class="card-title">Insert SMM</h5>
        <p class="card-text">Logged in as: {{ $user }}</p>
        <p class="card-text" v-if="current_smm">Current SMM: {{ current_smm }}</p>
        <p class="card-text" v-else>You currently have no SMM</p>

        <div class="card mt-4 options_container" v-if="smm_preview">
          <div class="card-body">
            <h5 class="card-title">SMM Preview</h5>
            <ProfileCard :profile_json="smm_preview" />
          </div>
        </div>
        <p class="card-text" v-else>No smm account for name: {{ smm }} found</p>

        <form @submit.prevent="insertSMM">
          <div class="form-group">
            <input type="text" class="form-control" v-model="smm" placeholder="Enter SMM" />
          </div>
          <button type="submit" class="btn btn-primary" style="background-color: #ff8900;">Insert SMM</button>
        </form>
      </div>
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
  </div>
  <div v-else>
    <p> you are not authorized to edit the settings of this profile</p>
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
      current_account_type: "",
      current_smm: null,
      smm: "",
      smm_preview: null,
    };
  },
  mounted() {
    //Send a GET request to /profiles/$user
    const name_of_profile = this.id;
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
        this.current_account_type = response.data.account_type;
        if (this.current_account_type == "premium") {
          this.current_smm = response.data.smm;
        }
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
  watch: {
    smm(newVal) {
      axios.get(`https://site222326.tw.cs.unibo.it/profiles/${newVal}`)
        .then((response) => {
          if (response.status == 200) {
            if (response.data.account_type == "smm") {
              this.smm_preview = response.data;
            } else {
              this.smm_preview = null;
            }
          }
        });
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
    changeAccountType(new_account_type) {
      const name_of_profile = this.$user;
      const jsonBody = {
        account_type: new_account_type,
      };
      axios
        .put(`https://site222326.tw.cs.unibo.it/profiles/${name_of_profile}/account_type`, jsonBody)
        .then((response) => {
          console.log(response.data);
          // notify the user that the upload was successful
          if (response.status == 200) {
            this.current_account_type = new_account_type;
            alert("Account type changed");
          }
        });
    },
    insertSMM() {
      const name_of_profile = this.$user;
      const jsonBody = {
        smm: this.smm,
      };
      axios
        .put(`https://site222326.tw.cs.unibo.it/profiles/${name_of_profile}/smm`, jsonBody)
        .then((response) => {
          console.log(response.data);
          // notify the user that the upload was successful
          if (response.status == 200) {
            this.current_smm = this.smm;
            alert("SMM inserted");
          }
          this.smm = "";
        });
    },
    deleteAccount() {
      // send a message to the user asking for confirmation
      if (confirm("Are you sure you want to delete your account?")) {
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
