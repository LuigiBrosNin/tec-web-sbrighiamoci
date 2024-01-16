<script setup>
  import ChannelCard from "@/components/ChannelCard.vue"
</script>

<template>
    <!-- navbar with fields to formulate a query to filter channels -->
    <button class="btn btn-primary mb-3 col-12 d-flex justify-content-center" style="background-color: #206f91"
        type="button" data-bs-toggle="collapse" data-bs-target="#formSection" aria-expanded="true"
        aria-controls="formSection">
        <img alt="Button image" class="icon not_selected button-image"
            src="https://site222326.tw.cs.unibo.it/icons/search-alt-1-svgrepo-com.svg" />
        Toggle Search Options
    </button>
    <div id="formSection" class="collapse">
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container justify-content-center">
                <div class="row justify-content-center">
                    <div class="col-lg-12">
                        <form @submit.prevent="submitForm" class="row g-3">
                            <div class="form-group">
                                <label for="name">Name</label>
                                <input type="text" class="form-control" id="name" v-model="query.name">
                            </div>
                            <div class="form-group">
                                <label for="owner">Owner</label>
                                <input type="text" class="form-control" id="owner" v-model="query.owner">
                            </div>
                            <div class="form-group">
                                <label for="type">Type</label>
                                <select class="form-control" id="type" v-model="query.type">
                                    <option value="privileged">Privileged</option>
                                    <option value="private">Private</option>
                                    <option value="required">Required</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="subscribers_num">Number of Subscribers</label>
                                <input type="number" class="form-control" id="subscribers_num"
                                    v-model="query.subscribers_num">
                            </div>
                            <div class="form-group d-flex justify-content-center">
                                <button type="submit" class="btn btn-primary custom-btn">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
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

    <!-- for function that defines every channel in the feed object-->
    <div v-for="channel in feed" :key="channel.name">
        <ChannelCard :channel_json="channel"></ChannelCard>
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
                name: "",
                owner: "",
                type: "",
                subscribers_num: 0,
            },
            queryToSend: {
                name: "",
                owner: "",
                type: "",
                subscribers_num: 0,
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
        if(this.$route.query.name != null) this.query.name = this.$route.query.name;
        if(this.$route.query.owner != null) this.query.owner = this.$route.query.owner;
        if(this.$route.query.type != null) this.query.type = this.$route.query.type;
        if(this.$route.query.subscribers_num != null) this.query.subscribers_num = this.$route.query.subscribers_num;
        
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
            const response2 = await fetch(this.getFetchUri(10));
            const feed2 = await response2.json();
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
            // process query if needed
        },
        getFetchUri(offset) {
            // constructing query omitting empty fields
            let returnUri = `https://site222326.tw.cs.unibo.it/channels/?startindex=${this.startIndex + offset
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
            console.log(JSON.stringify(this.query));
            //retrieve squeals and reset pages
            this.currentPage = 1;
            this.startIndex = 0;
            this.endIndex = 10;
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
