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
      <div v-if="ownedChannelsList.length > 0">
      <div v-for="own in ownedChannelsList" :key="own">
        <ChannelCard :id="own"></ChannelCard>
      </div>
    </div>
    <div v-else>
      <p class="text-center my-3"> No owned channels. </p>
    </div>

    <h2 class="text-center my-5"> MODERATED </h2>
    <div v-if="moderatedChannelsList.length > 0">
      <div v-for="mod in moderatedChannelsList" :key="mod">
        <ChannelCard :id="mod"></ChannelCard>
      </div>
    </div>
    <div v-else>
      <p class="text-center my-3"> No moderated channels. </p>
    </div>
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
      followedChannelsList: [],
      ownedChannelsList: [],
      moderatedChannelsList: [],
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
  },

  methods: {

    async fetchOwnedChannels() {
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

      for (const channel of fetched) {
        if (channel.owner === this.$user) {
          this.ownedChannelsList.push(channel.name);
        } else {
          this.moderatedChannelsList.push(channel.name);
        }
      }

      console.log("Owned Channels: ", this.ownedChannelsList);
      console.log("Moderated Channels: ", this.moderatedChannelsList);
      
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
      console.log("followedChannelsList: ", this.followedChannelsList)
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
