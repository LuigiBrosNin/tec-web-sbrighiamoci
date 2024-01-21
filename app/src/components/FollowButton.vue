<script setup>
const props = defineProps(["id"]);
</script>

<template>
  <div v-if="$user != id && $user != null">
    <button class="follow_button" @click="changeFollowStatus()" aria-label="Toggle Follow Status">
      <span class="follow" v-if="!followed">Follow</span>
      <span class="unfollow" v-else>Unfollow</span>
    </button>
  </div>
  <div v-else-if="$user == null">
    <a class="follow_button follow_link" href="https://site222326.tw.cs.unibo.it/login">Follow</a>
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
  display: block;
  width: calc(100% - 2em); /* 100% - the margin */
}

.follow{
  color: #fff;
}

.unfollow{
  color: red;
}

.follow_link{
  color: #fff;
  text-decoration: none;
  text-align: center;
}
</style>