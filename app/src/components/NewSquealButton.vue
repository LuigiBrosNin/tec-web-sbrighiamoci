<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <RouterLink to="/squealPut" class="new_squeal_button" aria-label="Create a new Squeal" role="button">
    <div class="new_squeal_button_content">
      <img class="new_squeal_button_image" src="https://site222326.tw.cs.unibo.it/icons/plus-svgrepo-com.svg" alt="Create a new Squeal"/>
      <p class="new_squeal_button_text">Create a new Squeal</p>
    </div>
  </RouterLink>
</template>

<style scoped>
p {
  margin: 0px;
}

.new_squeal_button {
  text-decoration: none;
  font-size: 1.4em;
  margin: 1em;
}

.new_squeal_button_content {
  width: fit-content;
  height: fit-content;
  color: #fff;
  background-color: #ff8900ff;
  padding: 0.3em 0.5em 0.3em 0.5em;
  border-radius: 1em;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.new_squeal_button_image {
  height: 1.7em;
  width: 1.7em;
  filter: brightness(0%) invert(100%);
}

@media screen and (max-width: 950px) {
  .new_squeal_button_text {
    display: none;
  }
}
</style>
