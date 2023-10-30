<script setup>
    const props = defineProps(['id', 'squeal_json']);
</script>

<template>
    <div class="squeal_container">
    <!--div class="squeal_container" v-if="!this.isPrivate"-->
        <p> §{{ channel }} </p>
        <div v-if="this.replyTo.length > 0">
            <p>Reply to:</p>
            <p v-for="i in this.replyTo">{{ i }}</p>
        </div>

        <div class="profile_data">
            <img class="profile_img" :src="this.authorProfilePicUrl"/>
            <p class="profile_name"> @{{ author }}</p>
        </div>

        <p class="squeal_body"> {{ body }} </p>
        <p> {{ date }} </p>

        <div class="interaction_data">
            <button class="interaction_button">
                <img class="interaction_img" src="https://site222326.tw.cs.unibo.it/icons/face-smile-svgrepo-com.svg"/>
                <p>{{ positiveReactions }}</p>
            </button>
            <button class="interaction_button">
                <img class="interaction_img" src="https://site222326.tw.cs.unibo.it/icons/face-frown-svgrepo-com.svg"/>
                <p>{{ negativeReactions }}</p>
            </button>
            <button class="interaction_button">
                <img class="interaction_img" src="https://site222326.tw.cs.unibo.it/icons/message-circle-dots-svgrepo-com.svg"/>
                <p>{{ replies }}</p>
            </button>
        </div>

        <p>See more...</p>
    </div>

</template>

<script>
export default {
    data() {
        return {
            author: "",
            authorProfilePicUrl: "",
            channel: "",
            replyTo: [],
            date: 0,
            body: "",
            media: "",
            positiveReactions: 0,
            negativeReactions: 0,
            replies: 0,
            isPrivate: false, // just a for a redundant check, it should never be true
        }
    },
    methods: {
        async fetchSqueal(id) {
            let fetched = await fetch(`https://site222326.tw.cs.unibo.it/squeals/${id}`, {
                method: "GET",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "Access-Control-Allow-Origin": "*"
                }
            });
            fetched = await fetched.json();
            this.populate(fetched);
            
        },
        populate(squealJson) {
            this.author = squealJson.author;
            this.authorProfilePicUrl = "https://picsum.photos/100/100"; // TODO: actually implement this
            this.channel = squealJson.receiver;
            this.replyTo = squealJson.reply_to;
            this.date = new Date(squealJson.date);
            this.body = squealJson.text;
            this.media = squealJson.media;
            this.positiveReactions = squealJson.positive_reactions;
            this.negativeReactions = squealJson.negative_reactions;
            this.replies = squealJson.replies_num;
            this.isPrivate = squealJson.is_private;
        }
    },
    created() {
        if(this.id != null) {
            this.fetchSqueal(this.id);
        } else if(this.squeal_json != null) {
            this.populate(this.squeal_json);
        }
    }
}
</script>

<style scoped>
.squeal_container {
    background-color: #fff;
    border-style: solid;
    border-width: thin;
    border-radius: 1em;
    margin: 0.5em 2em 0.5em 2em;
    padding: 1em;
}

.profile_data {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.profile_img {
    width: 4em;
    height: 4em;
    border-radius: 50%;
    margin: 0.5em;
}

.profile_name {
    font-size: 1.3em;
}

.squeal_body {
    font-size: 2em;
}

.interaction_data {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.interaction_button {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0em 0.5em 0em 0.5em;
    background-color: transparent;
    border-style: none;
    font-size: 1.1em;
}

.interaction_img {
    width: 1.7em;
}
</style>