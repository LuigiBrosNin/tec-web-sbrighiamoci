<script setup>
import Squeal from "@/components/Squeal.vue";
</script>

<template>
  <!-- for function that defines every squeal in the feed object-->
  <Squeal v-for="squeal in feed" :squeal_json="squeal"></Squeal>
  <!-- buttons to change page -->
  <div class="d-flex justify-content-center align-items-center my-3">
    <button
      class="btn btn-primary mr-2"
      :class="{ 'btn-disabled': isPrevDisabled }"
      @click="loadPrev()"
      :disabled="isPrevDisabled"
    >
      Load previous page
    </button>
    <span>Page: {{ currentPage }}</span>
    <button
      class="btn btn-primary ml-2"
      :class="{ 'btn-disabled': isNextDisabled }"
      @click="loadNext()"
      :disabled="isNextDisabled"
    >
      Load next page
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      feed: null,
      startIndex: 0,
      endIndex: 10,
      currentPage: 1,
      nextPageIsEmpty: false,
    };
  },
  computed: {
    isPrevDisabled() {
      return this.currentPage === 1;
    },
    isNextDisabled() {
      // Replace `nextPageIsEmpty` with the actual condition
      return this.nextPageIsEmpty;
    },
  },
  async mounted() {
    const response = await fetch("https://site222326.tw.cs.unibo.it/feed");
    // assigns the json to the feed variable
    this.feed = await response.json();
  },
  methods: {
    async loadNext() {
      this.startIndex += 10;
      this.endIndex += 10;
      const response = await fetch(
        `https://site222326.tw.cs.unibo.it/feed/?startindex=${this.startIndex}&endindex=${this.endIndex}`
      );
      // assigns the json to the feed variable
      this.feed = await response.json();
      // check if feed is empty
      if (this.feed.length == 0) {
        this.startIndex -= 10;
        this.endIndex -= 10;
      } else {
        this.currentPage++;
      }
      // lazy check to avoid making another request
      if (this.feed.length < 10) {
        this.nextPageIsEmpty = true;
      } else {
        // check if next page is empty for sure
        const response2 = await fetch(`https://site222326.tw.cs.unibo.it/feed/?startindex=${this.startIndex + 10}&endindex=${this.endIndex + 10}`);
        const feed2 = await response2.json();
        if (feed2.length == 0) {
          this.nextPageIsEmpty = true;
        } else {
          this.nextPageIsEmpty = false;
        }
      }
    },
    async loadPrev() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.startIndex -= 10;
        this.endIndex -= 10;
        const response = await fetch(
          `https://site222326.tw.cs.unibo.it/feed/?startindex=${this.startIndex}&endindex=${this.endIndex}`
        );
        // assigns the json to the feed variable
        this.feed = await response.json();
      }
    },
  },
};
</script>

<style scoped>
.btn-disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
