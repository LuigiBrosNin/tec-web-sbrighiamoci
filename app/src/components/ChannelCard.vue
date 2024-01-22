<script setup>
const props = defineProps(["id", "channel_json"]);
</script>

<template>
  <div class="card m-3" role="article">
    <div v-if="isValid" class="channelContainer d-flex">
      <div class="col-md-4 d-flex justify-content-center align-items-center">
        <img :src="profilePicUrl" class="card-img channel_img" alt="Profile Picture">
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">
            <RouterLink :to="`/channel/${name}`" role="link" tabindex="0"> §{{ name }} </RouterLink>
          </h5>

          <p class="card-text bio"> {{ bio }} </p>
          <div class="infoContainer d-flex justify-content-start">
            <p class="card-text "><small class="text-muted"> Owner: {{ owner }}</small></p>
            <p class="divider mx-4" aria-hidden="true"></p>
            <p class="card-text"><small class="text-muted"> Subscribers: {{ subscribersNum }} </small></p>
          </div>
          <div v-if="!isSubscribed">
            <button class="btn orange_btn" @click="subscribe"  role="button" aria-label="Subscribe to Channel"> Subscribe </button>
          </div>
          <div v-else>
            <button class="btn dark_orange_btn" @click="unsub"  role="button" aria-label="Unsubscribe from Channel"> Unsubscribe </button>
          </div>
        </div>
      </div>

      <div class="btn_area">
        <button v-if="$user === owner" class="settings_btn" @click="goToSettings" role="button" aria-label="Go to Channel Settings">
          <img class="settings_img" src="https://site222326.tw.cs.unibo.it/icons/gear-svgrepo-com.svg" alt="Settings Icon"/>
        </button>
      </div>

    </div>
    <div v-else>
       <p class="text-danger" role="alert">Channel not found</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      isValid: false,
      name: "",  // nome del canale
      owner: "",
      modList: [],
      profilePicUrl: "",
      bio: "",
      squealsList: [],
      numberOfSqueals: 0,
      subscribersList: [],
      subscribersNum: 0,
      type: "normal",
      isSubscribed: false,
    };
  },
  methods: {
    async fetchChannel(id) {
      let fetched = await fetch(
        `https://site222326.tw.cs.unibo.it/channels/${id}`,
        {
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      fetched = await fetched.json();
      this.populate(fetched);
    },

    populate(channelJson) {
      this.name = channelJson.name;
      this.owner = channelJson.owner;
      this.modList = channelJson.mod_list;
      if(channelJson.propic != null){
        this.profilePicUrl = "https://" + channelJson.propic;
      } else {
        this.profilePicUrl = "https://site222326.tw.cs.unibo.it/images/logoSquealer.svg";
      }
      this.squealsList = channelJson.squeals_list;
      this.numberOfSqueals = channelJson.squeals_num;
      this.subscribersList = channelJson.subscribers_list;
      this.subscribersNum = channelJson.subscribers_num;
      this.type = channelJson.type;
      this.bio = channelJson.bio;
      this.isSubscribed = channelJson.subscribers_list.includes(this.$user); // true se user è iscritto

      this.isValid = true;
    },

    async subscribe() {
      if(this.$user != null){
        try {
          const response = await axios.put(`https://site222326.tw.cs.unibo.it/profiles/${this.$user}/following_channels`, { channel_name: this.name });
          if (response.status === 200) {
            this.isSubscribed = true;
            // ricarico la lista degli iscritti e il numero di iscritti
            this.refresh();
          }
          else {
            console.log("response.status: ", response.status)
          }
        }
        catch (error) {
          console.error('Error during put request: ', error);
        }
      } else {
        window.location.replace("https://site222326.tw.cs.unibo.it/login");
      }
    },

    async unsub() {
      if(this.$user != null) {
        try {
          const response = await axios.put(`https://site222326.tw.cs.unibo.it/profiles/${this.$user}/following_channels`, { channel_name: this.name });
          if (response.status === 200) {
            this.isSubscribed = false;
            // ricarico la lista degli iscritti e il numero di iscritti
            this.refresh();
          }
        }
        catch (error) {
          console.error('Error during delete request: ', error);
        }
      } else {
        window.location.replace("https://site222326.tw.cs.unibo.it/login");
      }
    },
  
    async refresh() {
      console.log("refresh")
      const sub_resp = await axios.get(`https://site222326.tw.cs.unibo.it/channels/${this.name}/subscribers_list`)
      console.log("sub_resp: ", sub_resp)

      if (sub_resp.status === 200) {
        this.subscribersList = sub_resp.data
      }
      
      const num_resp = await axios.get(`https://site222326.tw.cs.unibo.it/channels/${this.name}/subscribers_num`)
      console.log("sub_resp: ", num_resp)

      if (num_resp.status === 200) {
        this.subscribersNum = num_resp.data
      }
    },

    goToSettings() {
      window.location.href = `https://site222326.tw.cs.unibo.it/app/channel/${this.name}/settings`;
    },

  },


  created() {
    if (this.id != null) {
      this.fetchChannel(this.id);
    } else if (this.channel_json != null) {
      this.populate(this.channel_json);
    }
  },
};
</script>

<style scoped>
.channel_img {
  width: 10em;
  height: 10em;
  border-radius: 50%;
  margin: 0.5em;
}

.bio {
  font-style: italic;
}

.orange_btn {
	background-color: #ff8900;
	color: white;
}

.dark_orange_btn {
	background-color: #b66101;
	color: white;
}

.settings_btn {
  background-color: #ffffff00;
  border-style: none;
}

.settings_img {
  width: 3em;
  filter: invert(60%) sepia(0%) saturate(326%) hue-rotate(315deg) brightness(95%) contrast(91%);
}

.btn_area {
  position: absolute;
  right: 0;
  top: 0;
  margin: 1em;
}

@media screen and (max-width: 420px) {
  .infoContainer {
    flex-direction: column;
  }

  .divider {
    display: none;
  }
}
</style>