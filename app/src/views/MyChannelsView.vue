<script setup>
import ChannelCard from "@/components/ChannelCard.vue"
import NotLoggedIn from "@/components/NotLoggedIn.vue"
import SearchChannelsView from "@/views/SearchChannelsView.vue"
import ChannelCreateView from "@/views/ChannelCreateView.vue"
</script>

<template>
  <!-- Pulsanti di commutazione -->
  <div class="d-flex justify-content-center my-3 myChannelsButtonsContainer">
    <button @click="showFollowedSection" id="followedChannelsButton" class="btn mx-2"
      :class="{ orange_btn: activeSection === 'followed_section', 'btn-secondary': activeSection !== 'followed_section', }" aria-label="Show Followed Channels">
      Followed </button>
    <button @click="showOwnedSection" id="ownedChannelsButton" class="btn mx-2"
      :class="{ orange_btn: activeSection === 'owned_section', 'btn-secondary': activeSection !== 'owned_section', }" aria-label="Show Owned Channels">
      Owned </button>
    <button @click="showSearchSection" id="searchChannelsButton" class="btn mx-2"
      :class="{ orange_btn: activeSection === 'search_section', 'btn-secondary': activeSection !== 'search_section', }" aria-label="Show Search Channels">
      Search </button>
    <button @click="showCreateSection" id="createChannelsButton" class="btn mx-2"
      :class="{ orange_btn: activeSection === 'create_section', 'btn-secondary': activeSection !== 'create_section', }" aria-label="Show Create Channel">
      Create </button>
  </div>


  <!-------------------- SEZIONE CANALI SEGUITI  ------------------->
  <div v-if="activeSection === 'followed_section'">
    <div v-if="$user != null">
      <div v-for="channel in tmpChannelsList" :key="channel">
        <ChannelCard :id="channel"></ChannelCard>
      </div>
  
      <div class="loadMoreContainer text-center">
        <div v-if="allChannelsLoaded"> No more channels. </div>
        <button v-if="!allChannelsLoaded" @click="loadMoreChannels" class="btn btn-primary loadMoreBtn" aria-label="Load More Followed Channels"> Load more </button>
      </div>
    </div>
    <div v-else>
      <NotLoggedIn></NotLoggedIn>
    </div>
  </div>

  <!-------------------- SEZIONE CANALI GESTITI / POSSEDUTI  --------------------->
  <div v-if="activeSection === 'owned_section'">
    <div v-if="$user != null">
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
    <div v-else>
      <NotLoggedIn></NotLoggedIn>
    </div>
  </div>

  <!-------------------- SEZIONE RICERCA CANALI  --------------------->
  <div v-if="activeSection === 'search_section'">
    <SearchChannelsView></SearchChannelsView>
  </div>

  <!-------------------- SEZIONE CREAZIONE CANALI  --------------------->
  <div v-if="activeSection === 'create_section'">
    <div v-if="$user != null">
      <ChannelCreateView></ChannelCreateView>
    </div>
    <div v-else>
      <NotLoggedIn></NotLoggedIn>
    </div>
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";

export default {
  data() {
    return {
      activeSection: "followed_section",
      followedChannelsList: [],   // lista completa dei canali seguiti dal profilo
      ownedChannelsList: [],
      moderatedChannelsList: [],
      tmpChannelsList: [],       // lista riempita mano a mano da pulsante LoadMore 
      allChannelsLoaded: false,
      loadMoreIndex: 0,
      pageDim: 3,
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
      this.loadMoreChannels()
    },

    loadMoreChannels() {
      const newChannels = this.followedChannelsList.slice(this.loadMoreIndex, this.loadMoreIndex + this.pageDim);
      this.loadMoreIndex += this.pageDim;
      if (newChannels.length == 0) {
        this.allChannelsLoaded = true;
      }
      else {
        this.tmpChannelsList.push(...newChannels);
      }
    },

    // --------------------------- ALTRO --------------------------------

    showFollowedSection() { this.activeSection = "followed_section"; },
    showOwnedSection() { this.activeSection = "owned_section"; },
    showSearchSection() { this.activeSection = "search_section"; },
    showCreateSection() { this.activeSection = "create_section"; },

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
}
</style>
