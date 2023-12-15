<script setup>
  import Squeal from "@/components/Squeal.vue";
  import FollowButton from "@/components/FollowButton.vue";
  import ProfileCard from "@/components/ProfileCard.vue"
  const props = defineProps(["id", "profile_json"]);
</script>

<template>
  <div class="container profile_container">
    <div class="row profile_main_data">
      <div class="col-sm-4">
        <img class="img-fluid rounded-circle profile_img" :src="profilePicUrl" />
      </div>
      <div class="col-sm-8">
        <h2 class="profile_name">@{{ name }}</h2>
        <p class="profile_type">{{ accountType }}</p>
        <button v-if="$user === name" class="btn btn-primary" @click="goToSettings">Settings</button>
        <div class="card">
          <div class="card-header" style="background-color: #ff8900;">Remaining Credits</div>
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
          <!-- <Squeal v-for="sq in squealsList" :id="sq"></Squeal>  -->
        </div>
      </div>

      <!-- Followers Cards -->
      <div class="tab-pane fade" id="pills-followers" role="tabpanel" aria-labelledby="pills-followers-tab">
        <div v-for="follower in tmpFollowersList" :key="follower">
          <ProfileCard :id="follower"></ProfileCard>
        </div>
        <div class="loadMoreContainer">
          <div v-if="tmpFollowersList.length < 1"> No more profiles. </div>
          <button @click="loadMoreFollowers" class="btn btn-primary loadMoreBtn"> Load more </button>
        </div>
      </div>

      <!-- Following Cards -->
      <div class="tab-pane fade" id="pills-following" role="tabpanel" aria-labelledby="pills-following-tab">
        <div v-for="follower in tmpFollowingList" :key="follower">
          <ProfileCard :id="follower"></ProfileCard>
        </div>
        <div class="loadMoreContainer">
          <div v-if="tmpFollowingList.length < 1"> No more profiles. </div>
          <button @click="loadMoreFollowing" class="btn btn-primary loadMoreBtn"> Load more </button>
        </div>
      </div>

      <!-- Channels Cards -->
      <div class="tab-pane fade" id="pills-following" role="tabpanel" aria-labelledby="pills-following-tab">
        <div v-for="channel in tmpChannelsList" :key="channel">
          <ChannelCard :id="channel"></ChannelCard>
        </div>
        <div class="loadMoreContainer">
          <div v-if="tmpChannelsList.length < 1"> No more channels. </div>
          <button @click="loadMoreChannels" class="btn btn-primary loadMoreBtn"> Load more </button>
        </div>
      </div>

    </div>
  </div>
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

      tmpFollowersList: [],
      tmpFollowingList: [],
      tmpChannelsList: [],
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
    },
    
    goToSettings() {
      window.location.href = `https://site222326.tw.cs.unibo.it/app/profile/${this.name}/settings`;
    },
    
    fetchFollowers() {
      this.loadMoreIndex = 0;
      this.tmpFollowersList = this.followersList.slice(this.loadMoreIndex, this.loadMoreIndex + this.pageDim);
    },
    loadMoreFollowers() {
      this.loadMoreIndex += this.pageDim;
      const newProfiles = this.followersList.slice(this.loadMoreIndex, this.loadMoreIndex + this.pageDim);
      if (newProfiles.length == 0) {
        alert("No more profiles to load.");
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
        alert("No more profiles to load.");
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
        alert("No more channels to load.");
      }
      this.tmpChannelsList.push(...newChannels);
    }
  },

  created() {
    if (this.id != null) {
      this.fetchProfile(this.id);
    } else if (this.profile_json != null) {
      this.populate(this.profile_json);
    }
  },
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

.message_button {
  margin: 1em;
  padding: 0.5em;
  border-radius: 1.2em;
  border-style: none;
  background-color: #085c84;
  font-weight: bold;
  display: block;
  width: -webkit-fill-available;
  text-align: center;
  color:white;
  text-decoration: none;
}

.loadMoreContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
