<script setup>
    import Squeal from "@/components/Squeal.vue"

    const props = defineProps(['id', 'squeal_json']);
</script>

<template>
    <Squeal :id="id" :squeal_json="squeal_json"></Squeal>
</template>