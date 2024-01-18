<script setup>
import Squeal from "@/components/Squeal.vue";
</script>

<template>
  <!-- navbar with fields to formulate a query to filter squeals -->
  <!-- params: Author (text), 
        popularity (number 0 -> 1), 
        end_date (in milliseconds, user can choose from a calendar), 
        start_date (in milliseconds, user can choose from a calendar), 
        positive_reactions (number), 
        negative_reactions (number),
        impressions (number),
        receiver (text), 
        Keyword (text, spaced by commas), 
        Mentions (text, spaced by commas),
        is_private (boolean)
    -->

  <button class="btn btn-primary mb-3 col-12 d-flex justify-content-center" style="background-color: #206f91"
    type="button" data-bs-toggle="collapse" data-bs-target="#formSection" aria-expanded="true"
    aria-controls="formSection">
    <img alt="Button image" class="icon not_selected button-image"
      src="https://site222326.tw.cs.unibo.it/icons/search-alt-1-svgrepo-com.svg" />
    Toggle Search Options
  </button>
  <div id="formSection" class="collapse show">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <form @submit.prevent="submitForm" class="row g-3">
          <div class="col-md-3">
            <label for="author" class="form-label fw-bold mb-2">Author</label>
            <input type="text" class="form-control" v-model="query.author" placeholder="Author" />
          </div>
          <div class="col-md-3">
            <label for="popularity" class="form-label fw-bold mb-2">Popularity</label>
            <select class="form-control" v-model="query.popularity">
              <option disabled value="">Select popularity</option>
              <option value="isPopular">Populars</option>
              <option value="isUnpopular">Unpopulars</option>
              <option value="isControversial">Controversial</option>
            </select>
          </div>
          <div class="col-md-3">
            <label for="start_date" class="form-label fw-bold mb-2">Older date</label>
            <input type="date" id="start_date" name="start_date" class="form-control" v-model="query.start_date" placeholder="Start Date" />
          </div>
          <div class="col-md-3">
            <label for="end_date" class="form-label fw-bold mb-2">Newer date</label>
            <input type="date" id="end_date" name="end_date" class="form-control" v-model="query.end_date" placeholder="End Date" />
          </div>
          <div class="col-md-3">
            <label for="positiveReactions" class="form-label fw-bold mb-2">N° of Positive Reactions</label>
            <input type="number" id="positiveReactions" name="positiveReactions" class="form-control" v-model="query.positiveReactions"
              placeholder="Positive Reactions" />
          </div>
          <div class="col-md-3">
            <label for="negativeReactions" class="form-label fw-bold mb-2">N° of Negative Reactions</label>
            <input type="number" id="negativeReactions" name="negativeReactions" class="form-control" v-model="query.negativeReactions"
              placeholder="Negative Reactions" />
          </div>
          <div class="col-md-3">
            <label for="impressions" class="form-label fw-bold mb-2">N° of Impressions</label>
            <input type="number" id="impressions" name="impressions" class="form-control" v-model="query.impressions" placeholder="Impressions" />
          </div>
          <div class="col-md-3">
            <label for="receiver" class="form-label fw-bold mb-2">Channel</label>
            <input type="text" id="receiver" name="receiver" class="form-control" v-model="query.receiver" placeholder="Receiver" />
          </div>
          <div class="col-md-3">
            <label for="keyword" class="form-label fw-bold mb-2">Keywords</label>
            <input type="text" id="keyword" name="keyword" class="form-control" v-model="query.keyword" placeholder="Keyword" />
            <small class="form-text text-muted">*separated by commas</small>
          </div>
          <div class="col-md-3">
            <label for="mentions" class="form-label fw-bold mb-2">Mentions</label>
            <input type="text" id="mentions" name="mentions" class="form-control" v-model="query.mentions" placeholder="Mentions" />
            <small class="form-text text-muted">*separated by commas</small>
          </div>
          <div class="col-12 d-flex justify-content-center">
            <button type="submit" class="btn" :style="{ backgroundColor: '#ff8900' }">
              Submit
            </button>
          </div>
        </form>
      </div>
    </nav>
  </div>

  <!-- buttons to change page -->
  <div class="d-flex justify-content-center align-items-center my-3">
    <button class="btn custom-btn mr-2" :class="{ 'btn-disabled': isPrevDisabled }" @click="loadPrev()"
      :disabled="isPrevDisabled">
      Load previous page
    </button>
    <span class="mx-3">Page: {{ currentPage }}</span>
    <button class="btn custom-btn ml-2" :class="{ 'btn-disabled': nextPageIsEmpty }" @click="loadNext()"
      :disabled="nextPageIsEmpty">
      Load next page
    </button>
  </div>

  <!-- for function that defines every squeal in the feed object-->
  <Squeal v-for="squeal in feed" :squeal_json="squeal" :key="squeal.id"></Squeal>

  <!-- buttons to change page -->
  <div class="d-flex justify-content-center align-items-center my-3">
    <button class="btn custom-btn mr-2" :class="{ 'btn-disabled': isPrevDisabled }" @click="loadPrev()"
      :disabled="isPrevDisabled">
      Load previous page
    </button>
    <span class="mx-3">Page: {{ currentPage }}</span>
    <button class="btn custom-btn ml-2" :class="{ 'btn-disabled': nextPageIsEmpty }" @click="loadNext()"
      :disabled="nextPageIsEmpty">
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
      query: {
        author: "",
        popularity: "",
        start_date: 0,
        end_date: Date.now(),
        positive_reactions: 0,
        negative_reactions: 0,
        impressions: 0,
        receiver: "",
        keyword: "",
        mentions: "",
        isPrivate: false,
      },
      queryToSend: {
        author: "",
        popularity: "",
        start_date: 0,
        end_date: Date.now(),
        positive_reactions: 0,
        negative_reactions: 0,
        impressions: 0,
        receiver: "",
        keyword: "",
        mentions: "",
        isPrivate: false,
      },
    };
  },
  computed: {
    isPrevDisabled() {
      return this.currentPage === 1;
    },
  },
  async mounted() {

    //initialize query field from $query
    if (this.$route.query.author != null) {
      this.query.author = this.$route.query.author;
    }
    if (this.$route.query.popularity != null) {
      this.query.popularity = this.$route.query.popularity;
    }
    if (this.$route.query.start_date != null) {
      this.query.start_date = this.$route.query.start_date;
    }
    if (this.$route.query.end_date != null) {
      this.query.end_date = this.$route.query.end_date;
    }
    if (this.$route.query.positive_reactions != null) {
      this.query.positive_reactions = this.$route.query.positive_reactions;
    }
    if (this.$route.query.negative_reactions != null) {
      this.query.negative_reactions = this.$route.query.negative_reactions;
    }
    if (this.$route.query.impressions != null) {
      this.query.impressions = this.$route.query.impressions;
    }
    if (this.$route.query.receiver != null) {
      this.query.receiver = this.$route.query.receiver;
    }
    if (this.$route.query.keyword != null) {
      this.query.keyword = this.$route.query.keyword;
    }
    if (this.$route.query.mentions != null) {
      this.query.mentions = this.$route.query.mentions;
    }

    this.updateValidQuery();
    const response = await fetch(this.getFetchUri(0));

    // assigns the json to the feed variable
    this.feed = await response.json();
    this.feedVersion++;

    // lazy check to avoid making another request
    if (this.feed.length < 10) {
      this.nextPageIsEmpty = true;
    } else {
      // check if next page is empty for sure
      const response2 = await fetch(
        `https://site222326.tw.cs.unibo.it/squeals/?startindex=${this.startIndex + 10
        }&endindex=${this.endIndex + 10}`
      );
      const feed2 = await response2.json();
      console.log("feed2 length: " + feed2.length);
      if (feed2.length == 0) {
        this.nextPageIsEmpty = true;
      } else {
        this.nextPageIsEmpty = false;
      }
    }
  },
  methods: {
    updateValidQuery() {
      // update query used for fetch
      this.queryToSend = JSON.parse(JSON.stringify(this.query));

      // convert start_date in milliseconds
      if (this.query.start_date != 0) {
        this.queryToSend.start_date = new Date(this.query.start_date).getTime();
      }
      // convert end_date in milliseconds
      if (this.query.end_date != 0) {
        this.queryToSend.end_date = new Date(this.query.end_date).getTime();
      }

      // parse keywords and mentions
      if (this.query.keyword != "") {
        this.queryToSend.keyword = this.query.keyword.split(",");
      }
      if (this.query.mentions != "") {
        this.queryToSend.mentions = this.query.mentions.split(",");
      }
      //remove spaces from keywords and mentions
      for (let i = 0; i < this.query.keyword.length; i++) {
        this.queryToSend.keyword[i] = this.query.keyword[i].trim();
      }
      for (let i = 0; i < this.query.mentions.length; i++) {
        this.queryToSend.mentions[i] = this.query.mentions[i].trim();
      }
    },
    getFetchUri(offset) {
      // constructing query omitting empty fields
      let returnUri = `https://site222326.tw.cs.unibo.it/squeals/?startindex=${this.startIndex + offset
        }&endindex=${this.endIndex + offset}`;
      for (const field of Object.keys(this.query)) {
        if (
          this.queryToSend[field] != "" &&
          this.queryToSend[field] != null &&
          this.queryToSend[field] != NaN &&
          this.queryToSend[field] != 0
        ) {
          returnUri += `&${field}=${this.queryToSend[field]}`;
        }
      }
      return returnUri;
    },
    async submitForm() {
      this.updateValidQuery();
      console.log(this.query);
      //retrieve squeals and reset pages
      this.currentPage = 1;
      this.startIndex = 0;
      this.endIndex = 9;
      const response = await fetch(this.getFetchUri(0));

      // assigns the json to the feed variable
      this.feed = await response.json();
      this.feedVersion++;

      // lazy check to avoid making another request
      if (this.feed.length < 10) {
        this.nextPageIsEmpty = true;
      } else {
        // check if next page is empty for sure
        const response2 = await fetch(this.getFetchUri(this.offset));
        const feed2 = await response2.json();
        console.log("feed2 length: " + feed2.length);
        if (feed2.length == 0) {
          this.nextPageIsEmpty = true;
        } else {
          this.nextPageIsEmpty = false;
        }
      }
    },
    async loadNext() {
      this.startIndex += 10;
      this.endIndex += 10;
      const response = await fetch(this.getFetchUri(0));
      // assigns the json to the feed variable
      this.feed = await response.json();
      this.feedVersion++;
      this.currentPage++;
      // check if feed is empty
      if (this.feed.length == 0) {
        this.loadPrev();
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
    async loadPrev() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }

      this.startIndex -= 10;
      this.endIndex -= 10;
      const response = await fetch(this.getFetchUri(0));

      // assigns the json to the feed variable
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
  background-color: #f0a34c;
}

.custom-btn:active {
  background-color: #916020 !important;
}

.btn-disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.button-image {
  width: 30px;
  /* Adjust as needed */
  height: 30px;
  /* Adjust as needed */
  filter: brightness(0%) invert(100%);
}
</style>
