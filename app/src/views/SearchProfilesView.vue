<template>
    <!-- navbar with fields to formulate a query to filter profiles -->
    <button class="btn btn-primary mb-3 col-12 d-flex justify-content-center" style="background-color: #206f91"
        type="button" data-bs-toggle="collapse" data-bs-target="#formSection" aria-expanded="true"
        aria-controls="formSection">
        <img alt="Button image" class="icon not_selected button-image"
            src="https://site222326.tw.cs.unibo.it/icons/search-alt-1-svgrepo-com.svg" />
        Toggle Search Options
    </button>
    <div id="formSection" class="collapse show">
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container justify-content-center">
                <div class="row justify-content-center">
                    <div class="col-lg-12">
                        <form @submit.prevent="submitForm" class="row g-3">
                            <div class="form-group col-md-6">
                                <label for="name">Name</label>
                                <input type="text" class="form-control" id="name" v-model="query.name">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="bio">Bio</label>
                                <input type="text" class="form-control" id="bio" v-model="query.bio">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="credit">Minimum available credit</label>
                                <input type="number" class="form-control" id="credit" v-model="query.credit">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="credit_type">Credit Type</label>
                                <select class="form-control" id="credit_type" v-model="query.credit_type">
                                    <option value="g">Daily</option>
                                    <option value="s">Weekly</option>
                                    <option value="m">Monthly</option>
                                </select>
                            </div>
                            <div class="form-group col-md-6">
                                <label for="credit_limits">Maximum possible credit</label>
                                <input type="number" class="form-control" id="credit_limits" v-model="query.credit_limits">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="credit_limits_type">Credit Limits Type</label>
                                <select class="form-control" id="credit_limits_type" v-model="query.credit_limits_type">
                                    <option value="g">Daily</option>
                                    <option value="s">Weekly</option>
                                    <option value="m">Monthly</option>
                                </select>
                            </div>
                            <div class="form-group col-md-6">
                                <label for="squeals_num">Number of squeals created</label>
                                <input type="number" class="form-control" id="squeals_num" v-model="query.squeals_num">
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
        <button class="btn custom-btn ml-2" :class="{ 'btn-disabled': this.nextPageIsEmpty }" @click="loadNext()"
            :disabled="this.nextPageIsEmpty">
            Load next page
        </button>
    </div>

    <!-- for function that defines every channel in the feed object-->
    <div v-for="profile in this.feed" :key="feedVersion" class="card mt-3">
        <div class="row no-gutters">
            <div class="col-md-4 d-flex justify-content-center align-items-center">
                <img v-if="profile.propic" :src="`https://site222326.tw.cs.unibo.it/profiles/${profile.name}/propic`" class="card-img profile_img" alt="Profile Picture">
                <img v-else src="https://site222326.tw.cs.unibo.it/images/user-default.svg" class="card-img profile_img"
                    alt="Profile Picture">
            </div>
            <div class="col-md-8">
                <div class="card-body">
                    <h5 class="card-title">
                        <a :href="`https://site222326.tw.cs.unibo.it/app/profile/${profile.name}`" class="text-decoration-none">{{ profile.name }}</a>
                    </h5>
                    <p class="card-text">{{ profile.bio }}</p>
                    <div class="row credits_info">
                        <div class="col">
                            <p class="card-text">
                                Daily: {{ profile.credit[0] }}/{{ profile.credit_limits[0] }}
                            </p>
                        </div>
                        <div class="col">
                            <p class="card-text">
                                Weekly: {{ profile.credit[1] }}/{{ profile.credit_limits[1] }}
                            </p>
                        </div>
                        <div class="col">
                            <p class="card-text">
                                Monthly: {{ profile.credit[2] }}/{{ profile.credit_limits[2] }}
                            </p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <p class="card-text">
                                Squeals: {{ profile.squeals_num }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- buttons to change page -->
    <div class="d-flex justify-content-center align-items-center my-3">
        <button class="btn custom-btn mr-2" :class="{ 'btn-disabled': isPrevDisabled }" @click="loadPrev()"
            :disabled="isPrevDisabled">
            Load previous page
        </button>
        <span class="mx-3">Page: {{ currentPage }}</span>
        <button class="btn custom-btn ml-2" :class="{ 'btn-disabled': this.nextPageIsEmpty }" @click="loadNext()"
            :disabled="this.nextPageIsEmpty">
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
                bio: "",
                credit: "",
                credit_type: "",
                credit_limits: "",
                credit_limits_type: "",
                squeals_num: "",
                followers_num: "",
                banned_until: "",
            },
            queryToSend: {
                name: "",
                bio: "",
                credit: "",
                credit_type: "",
                credit_limits: "",
                credit_limits_type: "",
                squeals_num: "",
                followers_num: "",
                banned_until: "",
            },
        };
    },
    computed: {
        isPrevDisabled() {
            return this.currentPage === 1;
        },
    },
    async mounted() {
        const response = await fetch(
            `https://site222326.tw.cs.unibo.it/profiles/?startindex=${this.startIndex}&endindex=${this.endIndex}`
        );
        // assigns the json to the feed variable
        this.feed = await response.json();
        this.feedVersion++;

        // lazy check to avoid making another request
        if (this.feed.length < 9) {
            this.nextPageIsEmpty = true;
        } else {
            // check if next page is empty for sure
            const response2 = await fetch(
                `https://site222326.tw.cs.unibo.it/profiles/?startindex=${this.startIndex + 10
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
            // process query if needed
        },
        getFetchUri(offset) {
            // constructing query omitting empty fields
            let returnUri = `https://site222326.tw.cs.unibo.it/profiles/?startindex=${this.startIndex + offset
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
            this.endIndex = 9;
            const response = await fetch(this.getFetchUri(0));

            // assigns the json to the feed variable
            this.feed = await response.json();
            this.feedVersion++;

            // lazy check to avoid making another request
            if (this.feed.length < 9) {
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

.profile_img {
  width: 16em;
  height: 16em;
  border-radius: 50%;
  margin: 0.5em;
}
</style>
