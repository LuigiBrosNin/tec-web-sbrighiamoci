<template>
  <header>
    <img alt="Squealer logo" class="logo" src="https://site222326.tw.cs.unibo.it/images/logoSquealer.svg" />
    <div class="title me-3">
      <h2 class="display-4">Squealer</h2>
    </div>
    <div class="alert alert-warning mt-3" v-if="$global.is_looping" role="alert">
      <div class="d-flex justify-content-between">
        <div class="me-3">
          <strong>Posting automatic squeals!</strong>
        </div>
        <div class="mr-3">
          <button class="btn btn-danger" @click="stopLoop">Stop</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  methods: {
    stopLoop() {
      this.$global.is_looping = false;
      clearTimeout(this.$global.timeout_id);
      console.log("Loop stopped");
    }
  }
}
</script>

<style scoped>
header {
  line-height: 1.5;
  width: 100vw;
  display: flex;
  place-items: start stretch;
  align-items: center;
  box-shadow: 0px 0px 5px;
  overflow: hidden;
  z-index: 10;

  justify-content: center;
}

.logo {
  height: 5vh;
}

.title {
  color: #ff8900ff;
  -webkit-text-stroke: 2px #c06700ff;
  text-align: center;
}

h2 {
  font-size: 3em !important;
  font-weight: bold;
}
</style>