<script setup>
const props = defineProps(['id', 'squeal_json']);
</script>

<template>
    <div class="squeal_container" v-if="isValid && !isPrivate" :id="squeal_id">
        <RouterLink :to="`/channel/${channel}`"> §{{ channel }} </RouterLink>
        <div v-if='replyTo != null && replyTo != ""'>
            <p>Reply to: 
                <RouterLink :to="`/squeal/${replyTo}`">{{ replyTo }}</RouterLink>
            </p>
        </div>

        <div class="profile_data">
            <img class="profile_img" :src="authorProfilePicUrl" />
            <RouterLink :to="`/profile/${author}`" class="profile_name"> @{{ author }}</RouterLink>
        </div>

        <p class="squeal_body" v-html="body"></p>
        <img class="squeal_media" v-if='media != null && media != ""'
            :src="`https://site222326.tw.cs.unibo.it/squeals/${squeal_id}/media`">

        <!-- leaflet map -->
        <div v-show="hasLocation()" id="mapcontainer">
            <div :id="'map' + squeal_id" style="height: 200px"></div>
        </div>

        <p> {{ date }} </p>

        <div class="interaction_data">
            <button
                :class="'interaction_button' + ' ' + (($user != null && positiveReactionsList.includes($user)) ? 'active_button' : '')"
                @click="addOrRemovePositiveReaction">
                <img class="interaction_img" src="https://site222326.tw.cs.unibo.it/icons/face-smile-svgrepo-com.svg" />
                <p class="interaction_counter">{{ positiveReactions }}</p>
            </button>
            <button
                :class="'interaction_button' + ' ' + (($user != null && negativeReactionsList.includes($user)) ? 'active_button' : '')"
                @click="addOrRemoveNegativeReaction">
                <img class="interaction_img" src="https://site222326.tw.cs.unibo.it/icons/face-frown-svgrepo-com.svg" />
                <p class="interaction_counter">{{ negativeReactions }}</p>
            </button>
            <RouterLink class="interaction_button" :to="`/squealPut/?replyto=${squeal_id}&receiver=${channel}`">
                <img class="interaction_img"
                    src="https://site222326.tw.cs.unibo.it/icons/message-circle-dots-svgrepo-com.svg" />
                <p class="interaction_counter">{{ replies }}</p>
            </RouterLink>
        </div>

        <RouterLink :to="`/squeal/${squeal_id}`">More info</RouterLink>

        <button v-if="canBeDeleted" class="delete_btn" @click="askToDelete">
            <img class="delete_img" src="https://site222326.tw.cs.unibo.it/icons/trash-svgrepo-com.svg" />
        </button>

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

            canBeDeleted: false
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
            this.body = this.parseText(squealJson.text);
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
        parseText(text){
            let parsedText = text.split(/(\ |\,|\.|\;|\:|\?|\!)/g);
            let newText = "";
            for(const index in parsedText){
                const word = parsedText[index];
                if(word.length > 0){
                    let firstChar = word[0];
                    console.log(firstChar);
                    if(firstChar == "#"){
                        newText = newText.concat('<a href="">' + word + '</a>');
                    } else if(firstChar == "@"){
                        newText = newText.concat('<a href="/profile/' + word.slice(1) + '">' + word + '</a>');
                    } else if(firstChar == "§"){
                        newText = newText.concat('<a href="/channel/' + word.slice(1) + '">' + word + '</a>');
                    } else {
                        newText = newText.concat(word);
                    }
                }
            }
            return newText;
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
        async addOrRemovePositiveReaction() {
            if (this.$user != null) {
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
        },
        async addOrRemoveNegativeReaction() {
            if (this.$user != null) {
                await fetch(
                    `https://site222326.tw.cs.unibo.it/squeals/${this.squeal_id}/negative_reactions_list`,
                    {
                        method: "POST",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                            "Access-Control-Allow-Origin": "*",
                        },
                    }
                );

                let negativeUsers = await fetch(
                    `https://site222326.tw.cs.unibo.it/squeals/${this.squeal_id}/negative_reactions_list`,
                    {
                        method: "GET",
                        headers: {
                            "Content-type": "application/json; charset=UTF-8",
                            "Access-Control-Allow-Origin": "*",
                        },
                    }
                );

                this.negativeReactionsList = await negativeUsers.json();
                this.negativeReactions = this.negativeReactionsList.length;
            }
            else {
                window.location.replace("https://site222326.tw.cs.unibo.it/login");
            }
        },
        async canUserDeleteIt() {
            let channel = await fetch(
                `https://site222326.tw.cs.unibo.it/channels/${this.channel}`,
                {
                    method: "GET",
                }
            );
            if (channel.status == 200) {
                channel = await channel.json();
                this.canBeDeleted = (this.$user != null) && (this.$user == this.author || this.$user == channel.owner || channel.mod_list.includes(this.$user));
            } else {
                this.canBeDeleted = false;
            }

        },
        askToDelete() {
            if (confirm("Are you sure you want to delete this squeal? This action can't be undone") == true) {
                this.deleteSqueal();
            } else {
                // do nothing
            }

        },
        async deleteSqueal() {
            let res = await fetch(
                `https://site222326.tw.cs.unibo.it/squeals/${this.squeal_id}`,
                {
                    method: "DELETE",
                }
            );
            if (res.status == 200) {
                this.isValid = false;
            }
        }
    },
    async created() {
        if (this.id != null) {
            await this.fetchSqueal(this.id);
        } else if (this.squeal_json != null) {
            this.populate(this.squeal_json);
        }
        this.canUserDeleteIt();

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
    position: relative;
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
    text-decoration: none;
}

.interaction_img {
    width: 1.7em;
}

.interaction_counter {
    margin: 0px;
    color: #000;
}

.active_button {
    filter: invert(74%) sepia(40%) saturate(7450%) hue-rotate(360deg) brightness(102%) contrast(104%);
}


.delete_btn {
    position: absolute;
    top: 0px;
    right: 0px;
    border-radius: 50%;
    border-style: none;
    background-color: #ffffff00;
    margin: 0.75em;
}

.delete_img {
    width: 2em;
    filter: invert(17%) sepia(87%) saturate(7277%) hue-rotate(359deg) brightness(109%) contrast(118%);
}
</style>