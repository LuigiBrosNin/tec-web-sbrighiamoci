<script setup>
const props = defineProps(["id", "profile_json"]);
</script>

<template>
  <div class="card m-3">
    <div v-if="isValid" class="d-flex">
      <div class="col-md-4 d-flex justify-content-center align-items-center">
        <img :src="profilePicUrl" class="card-img profile_img" alt="Profile Picture">
      </div>
      <div class="col-md-8">
        <div class="card-body">
          <h5 class="card-title">
            <RouterLink :to="`/profile/${name}`" class="text-decoration-none">{{ name }}</RouterLink>
          </h5>
          <p class="card-text">{{ bio }}</p>
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
          <div class="row">
            <div class="col">
              <p class="card-text">
                Squeals: {{ numberOfSqueals }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Profile not found</p>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      isValid: false,
      name: "",
      profilePicUrl: "",
      bio: "",
      credit: [0, 0, 0],
      creditLimits: [0, 0, 0],
      squealsList: [],
      followersList: [],
      followingList: [],
      accountType: "normal",
      extraCredit: 0,
      numberOfSqueals: 0,
      isBanned: false,
      bannedUntil: -1,
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

      if (fetched.status == 200) {
        fetched = await fetched.json();
        this.populate(fetched);
      }

    },
    populate(profileJson) {
      this.name = profileJson.name;

      // if propic is null, use a default one
      if (profileJson.propic == null || profileJson.propic == "") {
        this.profilePicUrl =
          "https://site222326.tw.cs.unibo.it/images/user-default.svg";
      } else {
        this.profilePicUrl = "https://" + profileJson.propic;
      }

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

      this.isValid = true;
    },
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
.profile_img {
  width: 10em;
  height: 10em;
  border-radius: 50%;
  margin: 0.5em;
  object-fit: cover;
}
</style>
