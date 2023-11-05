<script setup>
import { RouterLink, RouterView } from 'vue-router'

import Header from "@/components/Header.vue"
import Navbar from "@/components/Navbar.vue"
</script>

<template>
  <div class="page_wrapper">
    <Header title="Squealer"></Header>
    <div class="main_area">
      <Navbar></Navbar>

      <div class="content">
        <RouterLink to="/squealPut" class="new_squeal_button">
          <div class="new_squeal_button_content">
            <img class="new_squeal_button_image" src="https://site222326.tw.cs.unibo.it/icons/plus-svgrepo-com.svg" />
            <p class="new_squeal_button_text">Create a new Squeal</p>
          </div>
        </RouterLink>
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page_wrapper {
  display: flex;
  flex-direction: column;

  position: absolute;
  height: 100%;
  width: 100%;
  top: 0px;
  left: 0px;
}

Header {
  height: 15vh;
}

.main_area {
  height: 85vh;
  display: flex;
  flex-direction: row;
}

.content {
  position: relative;
  overflow-y: scroll;
  width: 100%;
  height: 100%;
  background-color: #ddddddff;
}
p {
  margin: 0px;
}

.new_squeal_button {
  text-decoration: none;
  font-size: 1.7em;
  margin: 1em;
  position: absolute;
  bottom: 0;
  right: 0;
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
  .main_area {
    display: flex;
    flex-direction: column-reverse;
  }

  .new_squeal_button_text {
    display: none;
  }
}
</style>
