<script setup>
const props = defineProps(['id', 'squeal_json']);
</script>

<template>
    <div class="squeal_container" v-if="isValid && !isPrivate">
        <p> §{{ channel }} </p> <!-- TODO add router link to channel -->
        <div v-if='replyTo != null && replyTo != ""'>
            <p>Reply to: {{ replyTo }}</p>
        </div>

        <div class="profile_data">
            <img class="profile_img" :src="authorProfilePicUrl" />
            <RouterLink :to="`/profile/${author}`" class="profile_name"> @{{ author }}</RouterLink>
        </div>

        <p class="squeal_body"> {{ body }} </p>
        <img class="squeal_media" v-if='media != null && media != ""'
            :src="`https://site222326.tw.cs.unibo.it/squeals/${squeal_id}/media`">

        <!-- leaflet map -->
        <div v-show="hasLocation()" id="mapcontainer">
            <div :id="'map' + squeal_id" style="height: 200px"></div>
        </div>

        <p> {{ date }} </p>

        <div class="interaction_data">
            <button :class="'interaction_button' + ' ' + (($user != null && positiveReactionsList.includes($user)) ? 'active_button' : '')" @click="addOrRemovePositiveReation">
                <img class="interaction_img" src="https://site222326.tw.cs.unibo.it/icons/face-smile-svgrepo-com.svg" />
                <p>{{ positiveReactions }}</p>
            </button>
            <button class="interaction_button">
                <img class="interaction_img" src="https://site222326.tw.cs.unibo.it/icons/face-frown-svgrepo-com.svg" />
                <p>{{ negativeReactions }}</p>
            </button>
            <button class="interaction_button">
                <img class="interaction_img"
                    src="https://site222326.tw.cs.unibo.it/icons/message-circle-dots-svgrepo-com.svg" />
                <p>{{ replies }}</p>
            </button>
        </div>

        <RouterLink :to="`/squeal/${squeal_id}`">Comments</RouterLink>
    </div>
    <div class="squeal_container" v-else>
        <p>Squeal not found</p>
    </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default {
    data() {
        return {
            isValid: false, // isValid becomes true if the squeal is correctly loaded
            squeal_id: "",
            author: "",
            authorProfilePicUrl: "",
            channel: "",
            replyTo: "",
            date: 0,
            body: "",
            media: "",
            positiveReactions: 0,
            positiveReactionsList: [],
            negativeReactions: 0,
            negativeReactionsList: [],
            replies: 0,
            location: {},
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
            if (fetched.status == 200) {
                fetched = await fetched.json();
                this.populate(fetched);
            }

        },
        populate(squealJson) {
            this.author = squealJson.author;
            //this.authorProfilePicUrl = "https://picsum.photos/100/100"; // random pic
            //this.authorProfilePicUrl = `https://site222326.tw.cs.unibo.it/profiles/${this.author}/propic`;
            this.authorProfilePicUrl = squealJson.author_propic;
            // if propic returns null, use a default one
            if (this.authorProfilePicUrl == null || this.authorProfilePicUrl == "") {
                this.authorProfilePicUrl = "https://site222326.tw.cs.unibo.it/images/user-default.svg";
            } else {
                this.authorProfilePicUrl = `https://site222326.tw.cs.unibo.it/profiles/${this.author}/propic`
            }
            this.squeal_id = squealJson.id;
            this.channel = squealJson.receiver;
            this.replyTo = squealJson.reply_to;
            this.date = new Date(squealJson.date);
            this.body = squealJson.text;
            this.media = squealJson.media;
            this.positiveReactions = squealJson.positive_reactions;
            this.positiveReactionsList = squealJson.positive_reactions_list;
            this.negativeReactions = squealJson.negative_reactions;
            this.negativeReactionsList = squealJson.negative_reactions_list;
            this.replies = squealJson.replies_num;
            this.location = squealJson.location;
            this.isPrivate = squealJson.is_private;

            console.log("propic: " + this.authorProfilePicUrl);
            this.isValid = true;
        },
        hasLocation() {
            return (this.location != null && this.location != "" && !(JSON.stringify(this.location) === "{}"));
        },
        showMap(divName) {
            if (this.hasLocation()) {
                const map = L.map(divName).setView(
                    [this.location.latitude, this.location.longitude],
                    13
                );
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 19,
                }).addTo(map);
                // Create a new icon
                const customIcon = L.icon({
                    iconUrl: "https://site222326.tw.cs.unibo.it/icons/squealer_marker.png",
                    iconSize: [38, 38], // size of the icon
                    iconAnchor: [19, 38], // point of the icon which will correspond to marker's location
                    popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
                });
                L.marker([this.location.latitude, this.location.longitude], {
                    icon: customIcon,
                }).addTo(map);
                return map;
            }
        },
        async registerImpression() {
            await fetch(
                `https://site222326.tw.cs.unibo.it/squeals/${this.squeal_id}/impressions`,
                {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json; charset=UTF-8",
                        "Access-Control-Allow-Origin": "*",
                    },
                }
            );
        },
        async addOrRemovePositiveReation() {
            if ($user != null) {
                await fetch(
                    `https://site222326.tw.cs.unibo.it/squeals/${this.squeal_id}/positive_reactions_list`,
                    {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                            "Access-Control-Allow-Origin": "*",
                        },
                    }
                );

                let positiveUsers = await fetch(
                    `https://site222326.tw.cs.unibo.it/squeals/${this.squeal_id}/positive_reactions_list`,
                    {
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                            "Access-Control-Allow-Origin": "*",
                        },
                    }
                );

                this.positiveReactionsList = await positiveUsers.json();
                this.positiveReactions = this.positiveReactionsList.length;
            }
            else {
                window.location.replace("https://site222326.tw.cs.unibo.it/login");
            }
        }
    },
    async created() {
        if (this.id != null) {
            await this.fetchSqueal(this.id);
        } else if (this.squeal_json != null) {
            this.populate(this.squeal_json);
        }

        this.registerImpression();
    },
    mounted() {

    },
    watch: {
        isValid(valid) {
            if (valid) {
                initMap(this);

                function initMap(component) {
                    setTimeout( // busy waiting until the dom is fully loaded
                        function () {
                            let div = document.getElementById("map" + component.squeal_id);
                            if (div != null) {
                                let createdMap = component.showMap(div);
                                const resizeObserver = new ResizeObserver((entries) => { // this is necessary in order to make the map function properly, otherwise it will believe its div is too small and will not load correctly
                                    if (createdMap != null) {
                                        createdMap.invalidateSize();
                                    }
                                });
                                resizeObserver.observe(div);
                            }
                            else {
                                initMap();
                            }
                        }, 500);

                }
            }
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
    border-color: #616161;
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

.squeal_media {
    width: 100%;
    border-style: solid;
    border-width: thin;
    border-radius: 1em;
    border-color: #616161;
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