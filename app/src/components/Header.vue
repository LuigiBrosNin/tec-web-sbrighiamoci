<template>
  <header>
    <div class="logout">
      <a v-if="$user != null" class="logout_btn" href="https://site222326.tw.cs.unibo.it/logout">
        <img class="logout_img" src="https://site222326.tw.cs.unibo.it/icons/door-open-svgrepo-com.svg" />
      </a>
    </div>

    <div class="logo_container">
      <img alt="Squealer logo" class="logo" src="https://site222326.tw.cs.unibo.it/images/logoSquealer.svg" />
      <div class="title me-3">
        <h2 class="display-4">Squealer</h2>
      </div>
    </div>

    <div class="alert_container">
      <div class="alert alert-warning m-3" v-if="$global.is_looping" role="alert">
        <div class="d-flex justify-content-between">
          <div class="me-3">
            <strong>Posting automatic squeals!</strong>
          </div>
          <div class="mr-3">
            <button class="btn btn-danger" @click="stopLoop">Stop</button>
          </div>
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
  flex: none;

  justify-content: center;
}

.logo_container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex: 0;
  margin: 1em;
}

.logo {
  height: 5em;
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

.alert_container {
  flex: 1;
  display: flex;
  flex-direction: row-reverse;
}
.alert {
  max-width: fit-content;
}

.logout {
  flex: 1
}

.logout_btn {
  margin: 1em;
  display: block;
}

.logout_img {
  width: 3em;
  filter: invert(17%) sepia(87%) saturate(7277%) hue-rotate(359deg) brightness(109%) contrast(118%);
}

@media screen and (max-width: 600px) {
  header {
    flex-direction: column-reverse;
    overflow:visible;
  }
}
</style>