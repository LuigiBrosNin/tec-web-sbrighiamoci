<script setup>
import Squeal from "@/components/Squeal.vue"
import ProfileCard from "@/components/ProfileCard.vue"

const props = defineProps(['id']);
</script>

<template>
    <Squeal :id="id"></Squeal>
    <div class="card_container">
        <ul class="nav nav-pills mb-3 flex-column flex-sm-row" id="pills-tab" role="tablist">
            <li class="nav-item flex-sm-fill" role="presentation">
                <button class="nav-link active" id="pills-replies-tab" data-bs-toggle="pill" data-bs-target="#pills-replies"
                    type="button" role="tab" aria-controls="pills-replies" aria-selected="true">
                    Replies
                </button>
            </li>
            <li class="nav-item flex-sm-fill text-sm-center" role="presentation">
                <button class="nav-link" id="pills-positive-reactions-tab" data-bs-toggle="pill"
                    data-bs-target="#pills-positive-reactions" type="button" role="tab"
                    aria-controls="pills-positive-reactions" aria-selected="false">
                    Positive Reactions
                </button>
            </li>
            <li class="nav-item flex-sm-fill text-sm-center" role="presentation">
                <button class="nav-link" id="pills-negative-reactions-tab" data-bs-toggle="pill"
                    data-bs-target="#pills-negative-reactions" type="button" role="tab"
                    aria-controls="pills-negative-reactions" aria-selected="false">
                    Negative Reactions
                </button>
            </li>
        </ul>

        <div class="tab-content" id="pills-tabContent">
            <div class="tab-pane fade show active" id="pills-replies" role="tabpanel" aria-labelledby="pills-replies-tab">
                <p v-if="replies.length == 0" class="no_items_message">There are no items to show</p>
                <div v-for="squealID in loadedReplies">
                    <Squeal :id="squealID"></Squeal>
                </div>
                <button v-if="loadedReplies.length < replies.length" @click="loadMoreReplies"
                    class="btn btn-primary justify-content-center loadMoreBtn"> Load more </button>
            </div>
            <div class="tab-pane fade" id="pills-positive-reactions" role="tabpanel"
                aria-labelledby="pills-positive-reactions-tab">
                <p v-if="positiveReactions.length == 0" class="no_items_message">There are no items to show</p>
                <div v-for="profileID in loadedPositiveReactions">
                    <ProfileCard :id="profileID"></ProfileCard>
                </div>
                <button v-if="loadedPositiveReactions.length < positiveReactions.length" @click="loadMorePositiveReactions"
                    class="btn btn-primary justify-content-center loadMoreBtn"> Load more </button>
            </div>
            <div class="tab-pane fade" id="pills-negative-reactions" role="tabpanel"
                aria-labelledby="pills-negative-reactions-tab">
                <p v-if="negativeReactions.length == 0" class="no_items_message">There are no items to show</p>
                <div v-for="profileID in loadedNegativeReactions">
                    <ProfileCard :id="profileID"></ProfileCard>
                </div>
                <button v-if="loadedNegativeReactions.length < negativeReactions.length" @click="loadMoreNegativeReactions"
                    class="btn btn-primary justify-content-center loadMoreBtn"> Load more </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            numberOfItemsToLoad: 5,
            replies: [],
            loadedReplies: [],
            positiveReactions: [],
            loadedPositiveReactions: [],
            negativeReactions: [],
            loadedNegativeReactions: []
        }
    },
    methods: {
        async fetchReplies() {
            let replies = await fetch(
                `https://site222326.tw.cs.unibo.it/squeals/${this.id}/replies`,
                {
                    method: "GET"
                }
            );

            if (replies.status == 200) {
                replies = await replies.json();
                this.replies = replies;
            }
        },
        async fetchPositiveReactions() {
            let positiveReactions = await fetch(
                `https://site222326.tw.cs.unibo.it/squeals/${this.id}/positive_reactions_list`,
                {
                    method: "GET"
                }
            );

            if (positiveReactions.status == 200) {
                positiveReactions = await positiveReactions.json();
                this.positiveReactions = positiveReactions;
            }
        },
        async fetchNegativeReactions() {
            let negativeReactions = await fetch(
                `https://site222326.tw.cs.unibo.it/squeals/${this.id}/negative_reactions_list`,
                {
                    method: "GET"
                }
            );

            if (negativeReactions.status == 200) {
                negativeReactions = await negativeReactions.json();
                this.negativeReactions = negativeReactions;
            }
        },
        loadMoreReplies() {
            let newReplies = this.replies.slice(this.loadedReplies.length, this.loadedReplies.length + this.numberOfItemsToLoad);
            this.loadedReplies = this.loadedReplies.concat(newReplies);
        },
        loadMorePositiveReactions() {
            let newReactions = this.positiveReactions.slice(this.loadedPositiveReactions.length, this.loadedPositiveReactions.length + this.numberOfItemsToLoad);
            this.loadedPositiveReactions = this.loadedPositiveReactions.concat(newReactions);
        },
        loadMoreNegativeReactions() {
            let newReactions = this.negativeReactions.slice(this.loadedNegativeReactions.length, this.loadedNegativeReactions.length + this.numberOfItemsToLoad);
            this.loadedNegativeReactions = this.loadedNegativeReactions.concat(newReactions);
        }
    },
    async created() {
        await this.fetchReplies();
        await this.fetchPositiveReactions();
        await this.fetchNegativeReactions();

        this.loadMoreReplies();
        this.loadMorePositiveReactions();
        this.loadMoreNegativeReactions();
    }
}
</script>

<style scoped>
.nav-link, .btn {
    display: flex;
    margin: auto;
}

.card_container {
    border-style: solid;
    border-width: thin;
    border-radius: 1em;
    border-color: #aaa;
    background-color: #fff;
    padding: 1em;
    margin: 1.5em 3em;
}

.no_items_message {
    display: flex;
    justify-content: center;
    font-size: 1.5em;
}

</style>