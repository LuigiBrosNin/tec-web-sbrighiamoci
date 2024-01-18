<script setup>
import MessagesSearchBar from "@/components/MessagesSearchBar.vue";
</script>

<template>
    <div class="container">
        <h3 class="d-flex justify-content-center m-2">Insert the name of the user you want to chat with:</h3>
        <label for="userSearch" class="sr-only">Search user by name</label>
        <MessagesSearchBar></MessagesSearchBar>
    </div>
</template>

<style scoped>
.container {
    background-color: #fff;
    border-radius: 1em;
    display: block;
}
</style>