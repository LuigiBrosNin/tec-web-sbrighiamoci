<script setup>
const props = defineProps(["id", "channel_json"]);
</script>

<template>
  <div class="card m-3">
    <div class="d-flex">
      <div class="col-md-4 d-flex justify-content-center align-items-center">
        <img :src="profilePicUrl" class="card-img channel_img" alt="Profile Picture">
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">
            <RouterLink :to="`/channel/${name}`"> §{{ name }} </RouterLink>
          </h5>
          <p class="card-text bio"> {{ bio }} </p>
          <div class="d-flex justify-content-start">
            <p class="card-text "><small class="text-muted"> Owner: {{ owner }}</small></p>
            <p class="card-text mx-5"><small class="text-muted"> Subscribers: {{ numberOfSubscribers }} </small></p>
          </div>
          <button class="btn orange_btn" @click="subscribe"> Subscribe </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      name: "",
      owner: "",
      modList: [],
      profilePicUrl: "",
      bio: "",
      squealsList: [],
      numberOfSqueals: 0,
      subscribersList: [],
      numberOfSubscribers: 0,
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
      console.log("FETCHED: ", fetched)
    },

    populate(channelJson) {
      this.name = channelJson.name;
      this.owner = channelJson.owner;
      this.modList = channelJson.mod_list;
      this.profilePicUrl = channelJson.propic;
      // if propic returns null, use a default one
      if (this.profilePicUrl == null || this.profilePicUrl == "") {
        this.profilePicUrl =
          "https://site222326.tw.cs.unibo.it/images/logoSquealer.svg";
      } else {
        this.profilePicUrl = `https://site222326.tw.cs.unibo.it/channels/${this.name}/propic`;
      }
      this.squealsList = channelJson.squeals_list;
      this.numberOfSqueals = channelJson.squeals_num;
      this.subscribersList = channelJson.subscribers_list;
      this.numberOfSubscribers = channelJson.subscribers_num;
      this.type = channelJson.type;
      this.bio = channelJson.bio;
      this.isSubscribed = channelJson.subscribers_list.includes(this.name); // true se user è iscritto
    },

    async subscribe() {
      //TODO cambiare bottonoe se sono sicritto o no
      // ricaricare card quando ho aggiunto utente (rifare fetch)
      console.log("sucscribe")
      const response = await axios.put(`https://site222326.tw.cs.unibo.it/channels/${this.new_channel_name}`, { bio: this.new_bio, type: this.channel_type } );
      try {
        const response = await axios.put(`https://site222326.tw.cs.unibo.it/channels/${this.name}/subscribers_list`);
        console.log('Risposta: ', response.data);
        if (response.status === 200) {
          this.isSubscribed = true;
          console.log("mi sono iscrito")
        }
      }
      catch (error) {
        console.error('Error during put request: ', error);
      }   
    }
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
</style>