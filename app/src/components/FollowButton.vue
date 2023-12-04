<script setup>
const props = defineProps(["id"]);
</script>

<template>
  <div v-if="/*$user*/ true">
    <button @click="changeFollowStatus()">
      <span v-if="!followed">Follow</span>
      <span v-else>Unfollow</span>
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
        return followersList.contains(this.$user);
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