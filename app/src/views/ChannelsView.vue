<script setup>
import Squeal from "@/components/Squeal.vue";
import ProfileCard from "@/components/ProfileCard.vue"
import ChannelCard from "@/components/ChannelCard.vue"
const props = defineProps(['id']);
</script>

<template>
    <div v-if="!isValid">
        <h3> Channel not found. </h3>
    </div>
    <div v-else>
        <div class="channelInfoContainer" :id="channelName">
            <!----------- card canale ---------->
            <ChannelCard :id="channelName" class="importedCard"></ChannelCard>
            <RouterLink v-if="typeOfChannel == 'private'" :to="`/squealPut?receiver=${channelName}`" class="channel_new_squeal_button">
                <div class="channel_new_squeal_button_content">
                    <img class="channel_new_squeal_button_image"
                        src="https://site222326.tw.cs.unibo.it/icons/plus-svgrepo-com.svg" alt="Create Squeal" />
                    <p class="channel_new_squeal_button_text" aria-label="Create a new squeal in this channel">Create a new Squeal in this channel</p>
                </div>
            </RouterLink>
        </div>

        <!-- Pulsanti di commutazione -->
        <div class="d-flex justify-content-center my-3">
            <button @click="showSquealSection" class="btn mx-2"
                :class="{ active_btn: activeSection === 'squeal', 'btn-secondary': activeSection !== 'squeal', }"> Squeals
            </button>
            <button @click="showFollowersSection" class="btn mx-2"
                :class="{ active_btn: activeSection === 'followers', 'btn-secondary': activeSection !== 'followers', }">
                Followers </button>
            <button @click="showModsSection" class="btn mx-2"
                :class="{ active_btn: activeSection === 'mods', 'btn-secondary': activeSection !== 'mods', }"> Mods
            </button>
        </div>


        <!-------------------- SEZIONE SQUEAL  --------------------->
        <div v-if="activeSection === 'squeal'">
            <div class="tab-pane fade show active" id="pills-squeals" role="tabpanel" aria-label="pills-squeals-tab">
                <div v-for="squeal in loadedSquealsList" :key="squeal">
                    <Squeal :id="squeal"> </Squeal>
                </div>
                <div class="loadMoreContainer text-center">
                    <button v-if="!allSquealsLoaded" @click="loadMoreSqueals" class="btn btn-primary loadMoreBtn"> Load more
                    </button>
                    <div v-else-if="squealsList.length <= 0">
                        There are no squeals to show.
                    </div>
                </div>
            </div>
        </div>

        <!-------------------- SEZIONE FOLLOWERS  --------------------->
        <div v-if="activeSection === 'followers'" class="squeal_container">

            <h2 class="text-center"> Subscribers: {{ subscribersNum }} </h2>

            <div v-for="follower in loadedSubscribersList" :key="follower">
                <ProfileCard :id="follower"></ProfileCard>
            </div>

            <div class="loadMoreContainer text-center">
                <button v-if="!allSubscribersLoaded" @click="loadMoreSubscribers" class="btn btn-primary loadMoreBtn"> Load
                    more </button>
            </div>
        </div>

        <!-------------------- SEZIONE MODS  --------------------->
        <div v-if="activeSection === 'mods'" class="squeal_container">
            <h2 class="text-center my-3 text-orange "> OWNER </h2>
            <ProfileCard :id="owner"></ProfileCard>

            <h2 class="text-center my-5"> MODS </h2>
            <div v-for="mod in modsList" :key="mod">
                <ProfileCard :id="mod"></ProfileCard>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default {
    data() {
        return {
            idd: this.id,
            channelName: this.id,
            typeOfChannel: "",
            activeSection: "squeal",
            squealsList: [],         // tutti gli id degli squeal del canale
            loadedSquealsList: [],   // id degli squeal già caricati 
            modsList: [],
            subscribersList: [],
            loadedSubscribersList: [],
            subscribersNum: 0,
            owner: "",
            allSquealsLoaded: false,
            allSubscribersLoaded: false,
            pageDim: 2,
            loadMoreIndex: 0,
            loadMoreSubsIndex: 0,
            isValid: false,
        };
    },
    methods: {
        async fetchMoreSqueals() {
            let fetched = await fetch(`https://site222326.tw.cs.unibo.it/channels/${this.channelName}/squeals_list?startindex=${this.loadMoreIndex}&endindex=${this.loadMoreIndex + this.pageDim}`,
                { method: "GET" }
            );
            if (fetched.status == 200) {
                fetched = await fetched.json();
                if (fetched.length <= 0) {
                    this.allSquealsLoaded = true;
                }
                this.validSquealsList = this.validSquealsList.concat(fetched);
            }
        },

        loadMoreSqueals() {
            this.loadMoreIndex += this.pageDim
            const newSqueals = this.squealsList.slice(this.loadMoreIndex, this.loadMoreIndex + this.pageDim)

            if (newSqueals.length === 0) {
                this.allSquealsLoaded = true;
            } else {
                this.loadedSquealsList = this.loadedSquealsList.concat(newSqueals);
            }
        },

        loadMoreSubscribers() {
            this.loadMoreSubsIndex += this.pageDim
            const newSubs = this.subscribersList.slice(this.loadMoreSubsIndex, this.loadMoreSubsIndex + this.pageDim)

            console.log("newSubs: ", newSubs)
            console.log("newSubs.length: ", newSubs.length)

            if (newSubs.length === 0) {
                this.allSubscribersLoaded = true;
            } else {
                this.loadedSubscribersList = this.loadedSubscribersList.concat(newSubs);
            }
        },

        showSquealSection() { this.activeSection = "squeal"; },
        showFollowersSection() { this.activeSection = "followers"; },
        showModsSection() { this.activeSection = "mods"; },
    },

    // alla creazione del componente fetcho tutto il contenuto del canale
    async created() {
        let fetched = await fetch(
            `https://site222326.tw.cs.unibo.it/channels/${this.channelName}`,
            {
                method: "GET",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        );

        if (fetched.status === 200) {
            fetched = await fetched.json();

            this.owner = fetched.owner;
            this.typeOfChannel = fetched.type;
            this.modsList = fetched.mod_list;
            this.subscribersNum = fetched.subscribers_num;
            this.subscribersList = fetched.subscribers_list;
            this.squealsList = fetched.squeals_list.reverse();

            this.loadedSquealsList = fetched.squeals_list.slice(this.loadMoreIndex, this.loadMoreIndex + this.pageDim)
            this.loadedSubscribersList = fetched.subscribers_list.slice(this.loadMoreSubsIndex, this.loadMoreSubsIndex + this.pageDim)

            this.isValid = true;
        }
    },
};
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

.title {
    text-align: center;
    margin-bottom: 20px;
}

.importedCard {
   border: none;
    margin: 0em !important;
}

.btn_dim {
    width: 5%;
}

.active_btn {
    background-color: #0d6efd;
    color: white;
}

.profile_img {
    width: 10em;
    height: 10em;
    border-radius: 50%;
    margin: 0.5em;
}

.text-orange {
    color: #ff8900;
}

.channelInfoContainer {
    background-color: #fff;
    padding: 0em 0em 1em 0em;
    margin: 1em;
    border-radius: 0.5em;
    border-color: #cbcbcb;
    border-style: solid;
    border-width: thin;
}

.channel_new_squeal_button_content {
  width: fit-content;
  height: fit-content;
  color: #fff;
  background-color: #085c84;
  padding: 0.3em 0.5em 0.3em 0.5em;
  border-radius: 1.5em;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.channel_new_squeal_button_image {
  height: 1.7em;
  width: 1.7em;
  filter: brightness(0%) invert(100%);
}

.channel_new_squeal_button {
  text-decoration: none;
  display: flex;
  justify-content: center;
}

.channel_new_squeal_button_text {
  font-size: 1.1em;
  margin: 0.2em;
}
</style>