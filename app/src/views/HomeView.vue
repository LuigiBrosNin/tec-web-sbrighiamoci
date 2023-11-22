<script setup>
import Squeal from "@/components/Squeal.vue";
</script>

<template>
  <!-- button to refresh current feed page -->
  <div class="d-flex justify-content-center align-items-center my-3">
    <button
      class="btn custom-btn"
      @click="refresh()"
    >
      Refresh feed
    </button>
  </div>
  <!-- buttons to change page -->
  <div class="d-flex justify-content-center align-items-center my-3">
    <button
      class="btn custom-btn mr-2"
      :class="{ 'btn-disabled': isPrevDisabled }"
      @click="loadPrev()"
      :disabled="isPrevDisabled"
    >
      Load previous page
    </button>
    <span class="mx-3">Page: {{ currentPage }}</span>
    <button
      class="btn custom-btn ml-2"
      :class="{ 'btn-disabled': nextPageIsEmpty }"
      @click="loadNext()"
      :disabled="nextPageIsEmpty"
    >
      Load next page
    </button>
  </div>

  <!-- for function that defines every squeal in the feed object-->
  <Squeal
    v-if="this.feed"
    v-for="squeal in this.feed"
    :squeal_json="squeal"
    :key="feedVersion"
  ></Squeal>

  <!-- buttons to change page -->
  <div class="d-flex justify-content-center align-items-center my-3">
    <button
      class="btn custom-btn mr-2"
      :class="{ 'btn-disabled': isPrevDisabled }"
      @click="loadPrev()"
      :disabled="isPrevDisabled"
    >
      Load previous page
    </button>
    <span class="mx-3">Page: {{ currentPage }}</span>
    <button
      class="btn custom-btn ml-2"
      :class="{ 'btn-disabled': this.nextPageIsEmpty }"
      @click="loadNext()"
      :disabled="this.nextPageIsEmpty"
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
      endIndex: 9,
      currentPage: 1,
      nextPageIsEmpty: true,
      offset: 10,
      feedVersion: 0,
    };
  },
  computed: {
    isPrevDisabled() {
      return this.currentPage === 1;
    },
  },
  async mounted() {
    const response = await fetch(this.getFetchUri(0));
    // assigns the json to the feed variable
    this.feed = await response.json();

    // lazy check to avoid making another request
    if (this.feed.length < 9) {
      this.nextPageIsEmpty = true;
    } else {
      // check if next page is empty for sure
      const response2 = await fetch(this.getFetchUri(this.offset));
      const feed2 = await response2.json();
      console.log("feed2 length: " + feed2.length)
      if (feed2.length == 0) {
        this.nextPageIsEmpty = true;
      } else {
        this.nextPageIsEmpty = false;
      }
    }
  },
  methods: {
    getFetchUri(offset) {
      return `https://site222326.tw.cs.unibo.it/feed/?startindex=${this.startIndex + offset}&endindex=${this.endIndex + offset}`;
    },
    async loadNext() {
      console.log("loadNext")
      this.startIndex += 10;
      this.endIndex += 10;
      const response = await fetch(this.getFetchUri(0));
      // assigns the json to the feed variable
      this.feed = null;
      this.feed = await response.json();
      this.feedVersion++;
      this.currentPage++;
      // check if feed is empty
      if (this.feed.length == 0) {
        this.loadPrev();
        this.nextPageIsEmpty = true;
        return;
      }

      // lazy check to avoid making another request
      if (this.feed.length < 10) {
        this.nextPageIsEmpty = true;
      } else {
        // check if next page is empty for sure
        const response2 = await fetch(this.getFetchUri(this.offset));
        const feed2 = await response2.json();
        if (feed2.length == 0) {
          this.nextPageIsEmpty = true;
        } else {
          this.nextPageIsEmpty = false;
        }
      }
    },
    async refresh() {
      console.log("refresh")
      const response = await fetch(this.getFetchUri(0));
      // assigns the json to the feed variable
      this.feed = null;
      this.feed = await response.json();
      this.feedVersion++;
      this.currentPage = 1;
      this.startIndex = 0;
      this.endIndex = 9;
      // lazy check to avoid making another request
      if (this.feed.length < 9) {
        this.nextPageIsEmpty = true;
      } else {
        // check if next page is empty for sure
        const response2 = await fetch(this.getFetchUri(this.offset));
        const feed2 = await response2.json();
        if (feed2.length == 0) {
          this.nextPageIsEmpty = true;
        } else {
          this.nextPageIsEmpty = false;
        }
      }
    },
    async loadPrev() {
      console.log("loadPrev")
      if (this.currentPage > 1) {
        this.currentPage--;
      }

      this.startIndex -= 10;
      this.endIndex -= 10;
      const response = await fetch(this.getFetchUri(0));

      // assigns the json to the feed variable
      this.feed = null;
      this.feed = await response.json();
      this.feedVersion++;

      // lazy check to avoid making another request
      if (this.feed.length < 10) {
        this.nextPageIsEmpty = true;
      } else {
        // check if next page is empty for sure
        const response2 = await fetch(this.getFetchUri(this.offset));
        const feed2 = await response2.json();
        if (feed2.length == 0) {
          this.nextPageIsEmpty = true;
        } else {
          this.nextPageIsEmpty = false;
        }
      }
    },
  },
};
</script>

<style scoped>
.custom-btn {
  background-color: #ff8900;
}

.custom-btn:hover {
  background-color: #2395c6;
}

.btn-disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
