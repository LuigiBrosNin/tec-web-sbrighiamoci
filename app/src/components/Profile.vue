<script setup>
import Squeal from "@/components/Squeal.vue"
const props = defineProps(['id', 'profile_json']);
</script>

<template>
    <div class="profile_main_data">
        <img class="profile_img" :src="profilePicUrl" />
        <p class="profile_name"> @{{ name }}</p>
        <div class="credits_info">
            <p>{{ credit[0] }}/{{ creditLimits[0] }}</p>
            <p>{{ credit[1] }}/{{ creditLimits[1] }}</p>
            <p>{{ credit[2] }}/{{ creditLimits[2] }}</p>
        </div>
    </div>
    <p>{{ bio }}</p>



    <ul class="nav nav-pills mb-3 flex-column flex-sm-row" id="pills-tab" role="tablist">
        <li class="nav-item flex-sm-fill" role="presentation">
            <button class="nav-link active" id="pills-squeals-tab" data-bs-toggle="pill" data-bs-target="#pills-squeals"
                type="button" role="tab" aria-controls="pills-squeals" aria-selected="true">Squeals</button>
        </li>
        <li class="nav-item flex-sm-fill text-sm-center" role="presentation">
            <button class="nav-link" id="pills-followers-tab" data-bs-toggle="pill" data-bs-target="#pills-followers"
                type="button" role="tab" aria-controls="pills-followers" aria-selected="false">Followers</button>
        </li>
        <li class="nav-item flex-sm-fill text-sm-center" role="presentation">
            <button class="nav-link" id="pills-following-tab" data-bs-toggle="pill" data-bs-target="#pills-following"
                type="button" role="tab" aria-controls="pills-following" aria-selected="false">Following</button>
        </li>
    </ul>

    <div class="tab-content" id="pills-tabContent">
        <div class="tab-pane fade show active" id="pills-squeals" role="tabpanel" aria-labelledby="pills-squeals-tab">
            <div v-if="squealsList.length > 0">
                <Squeal v-for="sq in squealsList" id="sq"></Squeal>
            </div>
        </div>
        <div class="tab-pane fade" id="pills-followers" role="tabpanel" aria-labelledby="pills-followers-tab">...</div>
        <div class="tab-pane fade" id="pills-following" role="tabpanel" aria-labelledby="pills-following-tab">...</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            name: "",
            profilePicUrl: "",
            bio: "",
            credit: [0, 0, 0],
            creditLimits: [0, 0, 0],
            squealsList: [],
            followersList: [],
            followingList: [],
            accountType: "normal",
            extraCredit: 0,
            numberOfSqueals: 0,
            isBanned: false,
            bannedUntil: -1,
        }
    },
    methods: {
        async fetchProfile(id) {
            let fetched = await fetch(`https://site222326.tw.cs.unibo.it/profiles/${id}`, {
                method: "GET",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "Access-Control-Allow-Origin": "*"
                }
            });
            fetched = await fetched.json();
            this.populate(fetched);

        },
        populate(profileJson) {
            this.name = profileJson.name;
            //this.profilePicUrl = profileJson.propic;
            this.profilePicUrl = "https://picsum.photos/100/100"; // TODO: actually implement this
            this.bio = profileJson.bio;
            this.credit = profileJson.credit;
            this.creditLimits = profileJson.credit_limits;
            this.squealsList = profileJson.squeals_list;
            this.followersList = profileJson.followers_list;
            this.followingList = profileJson.following_list;
            this.accountType = profileJson.account_type;
            this.extraCredit = profileJson.extra_credit;
            this.numberOfSqueals = profileJson.squeals_num;
            this.isBanned = profileJson.is_banned;
            this.bannedUntil = profileJson.banned_until;
        }
    },
    created() {
        if (this.id != null) {
            this.fetchProfile(this.id);
        } else if (this.profile_json != null) {
            this.populate(this.profile_json);
        }
    }
}
</script>