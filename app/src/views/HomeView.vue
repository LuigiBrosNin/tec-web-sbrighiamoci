<script setup>
  import Squeal from "@/components/Squeal.vue"
</script>

<template>
  <!-- for function that defines every squeal in the feed object-->
  <Squeal v-for="squeal in feed" :squeal_json="squeal"></Squeal>
</template>

<script>
export default{
  data() {
    return {
      feed: null
    }
  },
  async mounted() {
    const response = await fetch("https://site222326.tw.cs.unibo.it/feed")
    // assigns the json to the feed variable
    this.feed = await response.json()
  }
}
</script>
