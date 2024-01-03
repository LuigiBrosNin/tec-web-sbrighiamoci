<script setup>
import ChannelCard from "@/components/ChannelCard.vue"
import SearchChannelsView from "@/views/SearchChannelsView.vue"
import ChannelCreateView from "@/views/ChannelCreateView.vue"
</script>

<template>

  <!-- Pulsanti di commutazione -->
  <div class="d-flex justify-content-center my-3">
    <button @click="showFollowedSection" class="btn mx-2"
      :class="{ orange_btn: activeSection === 'followed_section', 'btn-secondary': activeSection !== 'followed_section', }">
      Followed </button>
    <button @click="showOwnedSection" class="btn mx-2"
      :class="{ orange_btn: activeSection === 'owned_section', 'btn-secondary': activeSection !== 'owned_section', }">
      Owned </button>
    <button @click="showSearchSection" class="btn mx-2"
      :class="{ orange_btn: activeSection === 'search_section', 'btn-secondary': activeSection !== 'search_section', }">
      Search </button>
    <button @click="showModifySection" class="btn mx-2"
      :class="{ orange_btn: activeSection === 'modify_section', 'btn-secondary': activeSection !== 'modify_section', }">
      Modify </button>
  </div>


  <!-------------------- SEZIONE CANALI SEGUITI  ------------------->
  <div v-if="activeSection === 'followed_section'">
    <div v-for="channel in followedChannelsList" :key="channel">
      <ChannelCard :id="channel"></ChannelCard>
    </div>

    <div class="loadMoreContainer text-center">
      <div v-if="followedChannelsList.length < 1"> No more channels. </div>
      <button v-if="!allChannelsLoaded" @click="loadMoreChannels" class="btn btn-primary loadMoreBtn"> Load more
      </button>
    </div>
  </div>

  <!-------------------- SEZIONE CANALI GESTITI / POSSEDUTI  --------------------->
  <div v-if="activeSection === 'owned_section'">
    <h2>THdfg</h2>
  </div>

  <!-------------------- SEZIONE RICERCA CANALI  --------------------->
  <div v-if="activeSection === 'search_section'">
    <SearchChannelsView></SearchChannelsView>
  </div>

  <!-------------------- SEZIONE MODIFICA CANALI  --------------------->
  <div v-if="activeSection === 'modify_section'">
    <ChannelCreateView></ChannelCreateView>
  </div>
</template>

<script>

import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default {
  data() {
    return {
      activeSection: "followed_section",

      // variabili per canali seguiti
      followedChannelsList: [],
      allChannelsLoaded: false,
      loadMoreIndex: 0,
      pageDim: 2,
    };
  },
  computed: {
    isPrevDisabled() {
      return this.currentPage === 1;
    },
  },
  async mounted() {

    this.fetchFollowedChannels()
    this.fetchOwnedChannels()

    //initialize query field from $query
    if (this.$route.query.name != null) this.query.name = this.$route.query.name;
    if (this.$route.query.owner != null) this.query.owner = this.$route.query.owner;
    if (this.$route.query.type != null) this.query.type = this.$route.query.type;
    if (this.$route.query.subscribers_num != null) this.query.subscribers_num = this.$route.query.subscribers_num;

    this.updateValidQuery();
    const response = await fetch(this.getFetchUri(0));
    // assigns the json to the feed variable
    this.feed = await response.json();
    this.feedVersion++;

    // lazy check to avoid making another request
    if (this.feed.length < 9) {
      this.nextPageIsEmpty = true;
    } else {
      // check if next page is empty for sure
      const response2 = await fetch(
        `https://site222326.tw.cs.unibo.it/channels/?startindex=${this.startIndex + 10
        }&endindex=${this.endIndex + 10}`
      );
      const feed2 = await response2.json();
      console.log("feed2 length: " + feed2.length);
      if (feed2.length == 0) {
        this.nextPageIsEmpty = true;
      } else {
        this.nextPageIsEmpty = false;
      }
    }
  },

  methods: {

    async fetchOwnedChannels() {

      console.log("feccio i canali seguiti")

      let fetched = await fetch(
        `https://site222326.tw.cs.unibo.it/profiles/${this.$user}/channels`,
        {
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      fetched = await fetched.json();
      console.log("canali seguiti fetchati: ", fetched)
    },

    async fetchFollowedChannels() {
      let fetched = await fetch(
        `https://site222326.tw.cs.unibo.it/profiles/${this.$user}`,
        {
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      fetched = await fetched.json();
      this.followedChannelsList = fetched.following_channels;
      console.log("followedChannelsList: ", followedChannelsList)
    },


    populate(profileJson) {
      this.followedChannelsList = profileJson.following_channels;

      /*
      this.name = profileJson.name;
      this.profilePicUrl = profileJson.propic;
      // if propic returns null, use a default one
      console.log(this.profilePicUrl);
      if (this.profilePicUrl == null || this.profilePicUrl == "") {
          this.profilePicUrl =
              "https://site222326.tw.cs.unibo.it/images/user-default.svg";
      } else {
          this.profilePicUrl = `https://site222326.tw.cs.unibo.it/profiles/${this.name}/propic`;
      }
      //this.profilePicUrl = "https://picsum.photos/100/100"; // TODO: actually implement this
      this.bio = profileJson.bio;
      this.credit = profileJson.credit;
      this.creditLimits = profileJson.credit_limits;
      this.squealsList = profileJson.squeals_list;
      this.followersList = profileJson.followers_list;
      this.followingList = profileJson.following_list;
      this.accountType = profileJson.account_type;
      this.extraCredit = profileJson.extra_credit;
      this.numberOfSqueals = profileJson.squeals_num;
      this.isBanned = profileJson.is_banned;
      this.bannedUntil = profileJson.banned_until;

      this.isValid = true;*/
    },

    loadMoreChannels() {
      this.loadMoreIndex += this.pageDim;
      const newChannels = this.followedChannelsList.slice(this.loadMoreIndex, this.loadMoreIndex + this.pageDim);
      if (newChannels.length == 0) {
        this.allChannelsLoaded = true;
      }
      this.tmpChannelsList.push(...newChannels);
    },

    // --------------------------- ALTRO --------------------------------

    showFollowedSection() { this.activeSection = "followed_section"; },
    showOwnedSection() { this.activeSection = "owned_section"; },
    showSearchSection() { this.activeSection = "search_section"; },
    showModifySection() { this.activeSection = "modify_section"; },
    showCreateSubsection() { this.activeSubsection = 'create'; },
    showModifySubsection() { this.activeSubsection = 'modify'; },

  },
};
</script>

<style scoped>
.custom-btn {
  background-color: #ff8900;
}

.custom-btn:hover {
  background-color: #f0a34c;
}

.custom-btn:active {
  background-color: #916020 !important;
}

.btn-disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.button-image {
  width: 30px;
  /* Adjust as needed */
  height: 30px;
  /* Adjust as needed */
  filter: brightness(0%) invert(100%);
}

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
}</style>
