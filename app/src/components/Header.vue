<script setup>
import Title from "@/components/Title.vue";

const props = defineProps(["title"]);
</script>

<template>
    <header>
      <img alt="Squealer logo" class="logo" src="@/assets/logoSquealer.svg" width="125" height="125" />
      <div class="wrapper">
        <Title></Title>
      </div>
    </header>
</template>

<style scoped>
header {
  line-height: 1.5;
  width: 100vw;
  display: flex;
  place-items: start stretch;
  box-shadow: 0px 0px 5px;
}

</style>