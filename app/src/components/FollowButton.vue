<script setup>
const props = defineProps(["id"]);
</script>

<template>
    <button v-if="!followed">Follow</button>
    <button v-else>Unfollow</button>
</template>

<script>
export default {
  data() {
    return {
      followed: false,
    };
  },
  methods: {
    
  },
  async created() {
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
      this.followed = !followersList.contains($user);
      console.log(this.followed);
  },
};
</script>