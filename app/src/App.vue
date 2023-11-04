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
        <!-- <p>aa {{ $attrs.props.user }}</p> -->
        <p>aa {{ $user }}</p>
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
  overflow-y: scroll;
  width: 100%;
  background-color: #ddddddff;
}

@media screen and (max-width: 950px) {
  .main_area {
    display: flex;
    flex-direction: column-reverse;
  }
}
</style>
