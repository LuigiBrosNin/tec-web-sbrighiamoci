<script setup>
const props = defineProps(["id"]);
</script>

<template>
  <div v-if="$user">
    <button class="follow_button" @click="changeFollowStatus()">
      <span class="follow" v-if="!followed">Follow</span>
      <span class="unfollow" v-else>Unfollow</span>
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      followed: false,
    };
  },
  methods: {
    async getFollowInfo(){
      let followersList = await fetch(
        `https://site222326.tw.cs.unibo.it/profiles/${this.id}/followers`,
        {
          method: "GET",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      followersList = await followersList.json();
      
      if(this.$user != null){
        return followersList.includes(this.$user);
      }
    },
    async changeFollowStatus(){
      await fetch(
        `https://site222326.tw.cs.unibo.it/profiles/${this.id}/followers`,
        {
          method: "PUT",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      this.followed = await this.getFollowInfo();
    },
  },
  async created() {
    this.followed = await this.getFollowInfo();
  },
};
</script>

<style scoped>
.follow_button {
  margin: 1em;
  padding: 0.5em;
  border-radius: 1.2em;
  border-style: none;
  background-color: #ff8900ff;
  font-weight: bold;
  width: -webkit-fill-available;
}

.follow{
  color: #fff;
}

.unfollow{
  color: red;
}
</style>