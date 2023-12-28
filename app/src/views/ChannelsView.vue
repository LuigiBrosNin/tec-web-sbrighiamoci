<template>
	<!-- Pulsanti di commutazione -->
	<div class="d-flex justify-content-center my-3">
		<button
			@click="showSquealSection"
			class="btn mx-2"
			:class="{
				orange_btn: activeSection === 'squeal',
				'btn-secondary': activeSection !== 'squeal',
			}"
		>
			Squeals
		</button>
		<button
			@click="showFollowersSection"
			class="btn mx-2"
			:class="{
				orange_btn: activeSection === 'followers',
				'btn-secondary': activeSection !== 'followers',
			}"
		>
			Followers
		</button>
		<button
			@click="showModsSection"
			class="btn mx-2"
			:class="{
				orange_btn: activeSection === 'mods',
				'btn-secondary': activeSection !== 'mods',
			}"
		>
			Mods
		</button>
	</div>

	<!-------------------- SEZIONE SQUEAL  --------------------->
	<div v-if="activeSection === 'squeal'" class="squeal_container">
		<div
			class="tab-pane fade show active"
			id="pills-squeals"
			role="tabpanel"
			aria-labelledby="pills-squeals-tab"
		>
			<div v-if="squealsList.length > 0">
				<Squeal v-for="sq in validSquealsList" :squeal_json="sq"></Squeal>
			</div>
			<div class="loadMoreContainer">
				<button
					v-if="!allSquealsLoaded"
					@click="fetchMoreSqueals"
					class="btn btn-primary loadMoreBtn"
				>
					Load more
				</button>
				<div v-else-if="squealsList.length <= 0">
					There are no squeals to show.
				</div>
			</div>
		</div>
	</div>

	<!-------------------- SEZIONE FOLLOWERS  --------------------->
	<div v-if="activeSection === 'followers'" class="squeal_container">
		followers
	</div>

	<!-------------------- SEZIONE MODS  --------------------->
	<div v-if="activeSection === 'mods'" class="squeal_container">mods</div>
</template>

<script>
    import axios from "axios";
    import L from "leaflet";
    import "leaflet/dist/leaflet.css";

    export default {
        data() {
            return {
                channelName: "fakechannel3",
                activeSection: "squeal",
                squealsList: [],
                modsList: [],
                subscribersList: [],
                subscribersNum: 0,
                owner: "",
                allSquealsLoaded: false,
                pageDim: 2,
                loadMoreIndex: 0,
            };
        },
        methods: {
            async fetchMoreSqueals() {
                let fetched = await fetch(
                    `https://site222326.tw.cs.unibo.it/channels/${
                        this.channelName
                    }/squeals_list?startindex=${this.loadMoreIndex}&endindex=${
                        this.loadMoreIndex + this.pageDim
                    }`,
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

            showSquealSection() {
                this.activeSection = "squeal";
            },
            showFollowersSection() {
                this.activeSection = "followers";
            },
            showModsSection() {
                this.activeSection = "mods";
            },
        },

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
            fetched = await fetched.json();

            console.log("FETCHATO: ", fetched)

            this.owner = fetched.owner;
            this.modsList = fetched.mods_list;
            this.subscribersNum = fetched.subscribers_num;
            this.subscribersList = fetched.subscribers_list;
            this.squealsList = fetched.squeals_list;
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

.btn_dim {
	width: 5%;
}

.orange_btn {
	background-color: #ff8900;
	color: white;
}

.orange_btn_low {
	background-color: #ffa947;
	color: white;
}

.profile_img {
	width: 10em;
	height: 10em;
	border-radius: 50%;
	margin: 0.5em;
}
</style>