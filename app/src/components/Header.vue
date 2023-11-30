<template>
    <header>
      <img alt="Squealer logo" class="logo" src="https://site222326.tw.cs.unibo.it/images/logoSquealer.svg"/>
      <div class="title">
        <h2>Squealer</h2>
      </div>
    </header>
</template>

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