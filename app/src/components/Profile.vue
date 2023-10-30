<script setup>
    const props = defineProps(['id', 'profile_json']);
</script>

<template>
    <div class="profile_main_data">
        <img class="profile_img" :src="profilePicUrl"/>
        <p class="profile_name"> @{{ name }}</p>
        <div class="credits_info">
            <p>{{ credit[0] }}/{{ creditLimits[0] }}</p>
            <p>{{ credit[1] }}/{{ creditLimits[1] }}</p>
            <p>{{ credit[2] }}/{{ creditLimits[2] }}</p>
        </div>
    </div>
    <p>{{ bio }}</p>
    
</template>

<script>
export default {
    data() {
        return {
            name: "",
            profilePicUrl: "",
            bio: "",
            credit: [0,0,0],
            creditLimits: [0,0,0],
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
        if(this.id != null) {
            this.fetchProfile(this.id);
        } else if(this.profile_json != null) {
            this.populate(this.profile_json);
        }
    }
}
</script>