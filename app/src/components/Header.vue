<template>
    <header>
      <img alt="Squealer logo" class="logo" src="@/assets/logoSquealer.svg"/>
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
}

.logo {
  height: 100%;
  margin: 1em;
}

.title {
    color: #ff8900ff;
    -webkit-text-stroke: 2px #c06700ff;
  }

h2 {
  font-size: 4em !important;
  font-weight: bold;
}
</style>