<script setup>
import Squeal from "@/components/Squeal.vue";
import FollowButton from "@/components/FollowButton.vue";
import ProfileCard from "@/components/ProfileCard.vue"
import ChannelCard from "@/components/ChannelCard.vue"
import { addAbortListener } from "stream";
const props = defineProps(["id", "profile_json"]);
</script>

<template>
  <div v-if="isValid" class="container profile_container" :id="id">
    <div class="row profile_main_data">
      <div class="col-sm-4">
        <img class="img-fluid rounded-circle profile_img" :src="profilePicUrl" />
      </div>
      <div class="col-sm-8">
        <h2 class="profile_name">@{{ name }}</h2>
        <p class="profile_type">{{ accountType }}</p>
        <div class="card">
          <div class="card-header">Remaining Credits</div>
          <div class="card-body">
            <div class="row credits_info">
              <div class="col">
                <p class="card-text">
                  Daily: {{ credit[0] }}/{{ creditLimits[0] }}
                </p>
              </div>
              <div class="col">
                <p class="card-text">
                  Weekly: {{ credit[1] }}/{{ creditLimits[1] }}
                </p>
              </div>
              <div class="col">
                <p class="card-text">
                  Monthly: {{ credit[2] }}/{{ creditLimits[2] }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <FollowButton :id="id"></FollowButton>
        <RouterLink :to="`/messages/${id}`" class="message_button">Chat</RouterLink>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <p>{{ bio }}</p>
      </div>
    </div>

    <div class="btn_area">
      <button v-if="$user === name" class="settings_btn" @click="goToSettings">
        <img class="settings_img" src="https://site222326.tw.cs.unibo.it/icons/gear-svgrepo-com.svg" />
      </button>
    </div>

    <ul class="nav nav-pills mb-3 flex-column flex-sm-row" id="pills-tab" role="tablist">
      <li class="nav-item flex-sm-fill" role="presentation">
        <button class="nav-link active" id="pills-squeals-tab" data-bs-toggle="pill" data-bs-target="#pills-squeals"
          type="button" role="tab" aria-controls="pills-squeals" aria-selected="true">
          Squeals
        </button>
      </li>
      <li class="nav-item flex-sm-fill text-sm-center" role="presentation">
        <button class="nav-link" id="pills-followers-tab" data-bs-toggle="pill" data-bs-target="#pills-followers"
          type="button" role="tab" aria-controls="pills-followers" aria-selected="false" @click="fetchFollowers">
          Followers
        </button>
      </li>
      <li class="nav-item flex-sm-fill text-sm-center" role="presentation">
        <button class="nav-link" id="pills-following-tab" data-bs-toggle="pill" data-bs-target="#pills-following"
          type="button" role="tab" aria-controls="pills-following" aria-selected="false" @click="fetchFollowing">
          Following
        </button>
      </li>
      <li class="nav-item flex-sm-fill text-sm-center" role="presentation">
        <button class="nav-link" id="pills-following-tab" data-bs-toggle="pill" data-bs-target="#pills-channels"
          type="button" role="tab" aria-controls="pills-following" aria-selected="false" @click="fetchChannels">
          Channels
        </button>
      </li>
    </ul>

    <div class="tab-content" id="pills-tabContent">

      <!-- Squeals Cards -->
      <div class="tab-pane fade show active" id="pills-squeals" role="tabpanel" aria-labelledby="pills-squeals-tab">
        <div v-if="squealsList.length > 0">
          <Squeal v-for="sq in validSquealsList" :squeal_json="sq"></Squeal>
        </div>
        <div class="loadMoreContainer">
          <button v-if="!allSquealsLoaded" @click="fetchMoreSqueals" class="btn btn-primary loadMoreBtn"> Load more
          </button>
          <div v-else-if="squealsList.length <= 0">
            There are no squeals to show.
          </div>
        </div>
      </div>

      <!-- Followers Cards -->
      <div class="tab-pane fade" id="pills-followers" role="tabpanel" aria-labelledby="pills-followers-tab">
        <div v-for="follower in tmpFollowersList" :key="follower">
          <ProfileCard :id="follower"></ProfileCard>
        </div>
        <div class="loadMoreContainer">
          <div v-if="tmpFollowersList.length < 1"> No more profiles. </div>
          <button v-if="!allFollowersLoaded" @click="loadMoreFollowers" class="btn btn-primary loadMoreBtn"> Load more
          </button>
        </div>
      </div>

      <!-- Following Cards -->
      <div class="tab-pane fade" id="pills-following" role="tabpanel" aria-labelledby="pills-following-tab">
        <div v-for="follower in tmpFollowingList" :key="follower">
          <ProfileCard :id="follower"></ProfileCard>
        </div>
        <div class="loadMoreContainer">
          <div v-if="tmpFollowingList.length < 1"> No more profiles. </div>
          <button v-if="!allFollowingLoaded" @click="loadMoreFollowing" class="btn btn-primary loadMoreBtn"> Load more
          </button>
        </div>
      </div>

      <!-- Channels Cards -->
      <div class="tab-pane fade" id="pills-channels" role="tabpanel" aria-labelledby="pills-channels-tab">
        <div v-for="channel in tmpChannelsList" :key="channel">
          <ChannelCard :id="channel"></ChannelCard>
        </div>
        <div class="loadMoreContainer">
          <div v-if="tmpChannelsList.length < 1"> No more channels. </div>
          <button v-if="!allChannelsLoaded" @click="loadMoreChannels" class="btn btn-primary loadMoreBtn"> Load more
          </button>
        </div>
      </div>

    </div>
  </div>
  <div v-else> Profile not found </div>
</template>

<script>
export default {
  data() {
    return {
      name: "",
      profilePicUrl: "",
      bio: "",
      credit: [0, 0, 0],
      creditLimits: [0, 0, 0],
      squealsList: [],
      followersList: [],
      followingList: [],
      channelFollowingList: [],
      accountType: "normal",
      extraCredit: 0,
      numberOfSqueals: 0,
      isBanned: false,
      bannedUntil: -1,

      isValid: false,

      validSquealsList: [],
      allSquealsLoaded: false,
      tmpFollowersList: [],
      allFollowersLoaded: false,
      tmpFollowingList: [],
      allFollowingLoaded: false,
      tmpChannelsList: [],
      allChannelsLoaded: false,
      loadMoreIndex: 0,
      pageDim: 2,  // dimensione di una "pagina" da caricare
    };
  },
  methods: {
    async fetchProfile(id) {
      let fetched = await fetch(
        `https://site222326.tw.cs.unibo.it/profiles/${id}`,
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

    populate(profileJson) {
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
      this.channelFollowingList = profileJson.following_channels;
      this.accountType = profileJson.account_type;
      this.extraCredit = profileJson.extra_credit;
      this.numberOfSqueals = profileJson.squeals_num;
      this.isBanned = profileJson.is_banned;
      this.bannedUntil = profileJson.banned_until;

      this.isValid = true;
    },

    goToSettings() {
      window.location.href = `https://site222326.tw.cs.unibo.it/app/profile/${this.name}/settings`;
    },

    async fetchMoreSqueals() {
      let fetched = await fetch(
        `https://site222326.tw.cs.unibo.it/squeals/?author=${this.name}&startindex=${this.validSquealsList.length}&endindex=${this.validSquealsList.length + this.pageDim}`,
        {
          method: "GET",
        }
      );
      if (fetched.status == 200) {
        fetched = await fetched.json();
        if (fetched.length <= 0) {
          this.allSquealsLoaded = true;
        }
        this.validSquealsList = this.validSquealsList.concat(fetched);
      }
    },
    fetchFollowers() {
      this.loadMoreIndex = 0;
      this.tmpFollowersList = this.followersList.slice(this.loadMoreIndex, this.loadMoreIndex + this.pageDim);
    },
    loadMoreFollowers() {
      this.loadMoreIndex += this.pageDim;
      const newProfiles = this.followersList.slice(this.loadMoreIndex, this.loadMoreIndex + this.pageDim);
      if (newProfiles.length == 0) {
        this.allFollowersLoaded = true;
      }
      this.tmpFollowersList.push(...newProfiles);
    },

    fetchFollowing() {
      this.loadMoreIndex = 0;
      this.tmpFollowingList = this.followingList.slice(this.loadMoreIndex, this.loadMoreIndex + this.pageDim);
    },
    loadMoreFollowing() {
      this.loadMoreIndex += this.pageDim;
      const newProfiles = this.followingList.slice(this.loadMoreIndex, this.loadMoreIndex + this.pageDim);
      if (newProfiles.length == 0) {
        this.allFollowingLoaded = true;
      }
      this.tmpFollowingList.push(...newProfiles);
    },

    fetchChannels() {
      this.loadMoreIndex = 0;
      this.tmpChannelsList = this.channelFollowingList.slice(this.loadMoreIndex, this.loadMoreIndex + this.pageDim);
    },
    loadMoreChannels() {
      this.loadMoreIndex += this.pageDim;
      const newChannels = this.channelFollowingList.slice(this.loadMoreIndex, this.loadMoreIndex + this.pageDim);
      if (newChannels.length == 0) {
        this.allChannelsLoaded = true;
      }
      this.tmpChannelsList.push(...newChannels);
    }
  },

  async created() {
    if (this.id != null) {
      await this.fetchProfile(this.id);
    } else if (this.profile_json != null) {
      await this.populate(this.profile_json);
    }
    this.fetchMoreSqueals();
  },
  watch: {
    id(newId) { //the router don't really reload the component if you switch between /profile/user1 and /profile/user2, so we force it.
      this.$router.go(this.$router.currentRoute);
    },
    profile_json(newProfile) {
      this.$router.go(this.$router.currentRoute);
    }
  }
};
</script>

<style scoped>
.profile_container {
  background-color: #fff;
  border-style: solid;
  border-width: thin;
  border-radius: 1em;
  border-color: #616161;
  margin: 0.5em 1em 0.5em 1em;
  display: block;
  width: auto;
  max-width: none;
  padding: 1em;
}

.nav-link {
  margin: auto;
}

.profile_img {
  width: 16em;
  height: 16em;
  border-radius: 50%;
  margin: 0.5em;
}

.btn_area {
  position: absolute;
  right: 0;
  top: 0;
  margin: 1em;
}

.settings_btn {
  background-color: #ffffff00;
  border-style: none;
}

.settings_img {
  width: 3em;
  filter: invert(60%) sepia(0%) saturate(326%) hue-rotate(315deg) brightness(95%) contrast(91%);
}

.card-header {
  background-color: #ff8900;
}

.message_button {
  margin: 1em;
  padding: 0.5em;
  border-radius: 1.2em;
  border-style: none;
  background-color: #085c84;
  font-weight: bold;
  display: block;
  width: auto;
  text-align: center;
  color: white;
  text-decoration: none;
}

.loadMoreContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
