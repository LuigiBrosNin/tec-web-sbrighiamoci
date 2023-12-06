<script setup>
import { RouterLink, RouterView } from 'vue-router'

import Header from "@/components/Header.vue"
import Navbar from "@/components/Navbar.vue"
import NewSquealButton from "@/components/NewSquealButton.vue"
</script>

<template>
  <div class="page_wrapper">
    <Header title="Squealer"></Header>
    <div class="main_area">
      <Navbar></Navbar>
      <NewSquealButton id="NewSquealButton"></NewSquealButton>

      <div class="content">
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
  height: 10vh;
}

.main_area {
  height: 90vh;
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

#NewSquealButton {
  z-index: 99999;
  position: absolute;
  bottom: 0;
  right: 0;
}

@media screen and (max-width: 950px) {
  .main_area {
    display: flex;
    flex-direction: column-reverse;
  }

  #NewSquealButton{
    bottom: 2em;
  }
}
</style>
