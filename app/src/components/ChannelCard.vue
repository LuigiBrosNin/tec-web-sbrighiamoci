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
            <a :href="`https://site222326.tw.cs.unibo.it/app/channels/${name}`" class="text-decoration-none">{{ name
            }}</a>
          </h5>
          <p class="card-text">{{ bio }}</p>
          <p class="card-text"><small class="text-muted">Owner: {{ owner }}</small></p>
          <p class="card-text"><small class="text-muted">Subscribers: {{ numberOfSubscribers }}</small></p>
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
      owner: "",
      modList: [],
      profilePicUrl: "",
      bio: "",
      squealsList: [],
      numberOfSqueals: 0,
      subscribersList: [],
      numberOfSubscribers: 0,
      type: "normal",
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
</style>