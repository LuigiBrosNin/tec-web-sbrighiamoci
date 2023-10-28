<template></template>

<script>
export default {
    data() {
        return {
            author: "",
            authorProfilePicUrl: "",
            channel: "",
            replyTo: null,
            date: 0,
            body: "",
            media: null,
            positiveReactions: 0,
            negativeReactions: 0,
            replies: 0,
            is_private: false, // just a for a redundant check, it should never be true
        }
    },
    methods: {
        async fetchSqueal() {
            let res = await fetch("https://pokeapi.co/api/v2/pokemon/ditto", {
                method: "GET",
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "Access-Control-Allow-Origin": "*"
                }
            });
            await res.json();
            console.log(res);
        }
    },
    created() {
        this.fetchSqueal();
    }
}
</script>